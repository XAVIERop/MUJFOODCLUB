-- Create database trigger to automatically send push notifications
-- This trigger calls the Supabase Edge Function when order status changes

-- Function to send push notification via Edge Function
CREATE OR REPLACE FUNCTION public.send_push_notification_on_order_update()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_cafe_id UUID;
  v_order_number TEXT;
  v_customer_name TEXT;
  v_total_amount NUMERIC;
BEGIN
  -- Only process if status actually changed
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    v_user_id := NEW.user_id;
    v_cafe_id := NEW.cafe_id;
    v_order_number := NEW.order_number;
    v_total_amount := NEW.total_amount;
    
    -- Get customer name
    SELECT full_name INTO v_customer_name
    FROM public.profiles
    WHERE id = v_user_id;
    
    -- For INSERT (new orders), send notification to cafe staff
    -- Note: This is handled in the application code, but we can also add it here
    IF TG_OP = 'INSERT' THEN
      -- Send new order notification to cafe staff
      -- This will be called via Edge Function from application code
      PERFORM net.http_post(
        url := current_setting('app.supabase_url', true) || '/functions/v1/send-push-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key', true)
        ),
        body := jsonb_build_object(
          'cafeId', v_cafe_id,
          'heading', 'New Order Received! 📦',
          'content', 'Order #' || v_order_number || ' for ₹' || v_total_amount || ' from ' || COALESCE(v_customer_name, 'Customer'),
          'data', jsonb_build_object(
            'type', 'new_order',
            'order_id', NEW.id,
            'order_number', v_order_number,
            'total_amount', v_total_amount
          ),
          'url', '/pos-dashboard?order=' || NEW.id,
          'notificationType', 'new_order_for_cafe'
        )
      );
    END IF;
    
    -- For UPDATE (status changes), send notification to customer
    IF TG_OP = 'UPDATE' THEN
      -- Send status update notification to customer
      PERFORM net.http_post(
        url := current_setting('app.supabase_url', true) || '/functions/v1/send-push-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key', true)
        ),
        body := jsonb_build_object(
          'userId', v_user_id,
          'heading', CASE NEW.status
            WHEN 'received' THEN 'Order Received! 🎉'
            WHEN 'confirmed' THEN 'Order Confirmed! ✅'
            WHEN 'preparing' THEN 'Order Being Prepared! 👨‍🍳'
            WHEN 'on_the_way' THEN 'Order Out for Delivery! 🚚'
            WHEN 'completed' THEN 'Order Delivered! 🎊'
            WHEN 'cancelled' THEN 'Order Cancelled'
            ELSE 'Order Update'
          END,
          'content', CASE NEW.status
            WHEN 'received' THEN 'Your order #' || v_order_number || ' has been received and is being processed.'
            WHEN 'confirmed' THEN 'Your order #' || v_order_number || ' has been confirmed by the cafe.'
            WHEN 'preparing' THEN 'Your order #' || v_order_number || ' is now being prepared.'
            WHEN 'on_the_way' THEN 'Your order #' || v_order_number || ' is on its way to you.'
            WHEN 'completed' THEN 'Your order #' || v_order_number || ' has been delivered. Enjoy your meal!'
            WHEN 'cancelled' THEN 'Your order #' || v_order_number || ' has been cancelled.'
            ELSE 'Your order #' || v_order_number || ' status has been updated to ' || NEW.status || '.'
          END,
          'data', jsonb_build_object(
            'type', 'order_status_update',
            'order_id', NEW.id,
            'order_number', v_order_number,
            'status', NEW.status
          ),
          'url', '/order-tracking/' || NEW.id,
          'notificationType', 'order_' || NEW.status
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The above function uses net.http_post which requires the http extension
-- For now, we'll handle notifications in the application code
-- This trigger is kept for reference but notifications are sent from the app

-- Alternative: Create a simpler trigger that just logs (notifications sent from app)
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- This function just ensures the trigger exists
  -- Actual notifications are sent from application code
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Log the status change (optional)
    RAISE NOTICE 'Order % status changed from % to %', NEW.order_number, OLD.status, NEW.status;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (if it doesn't exist)
DROP TRIGGER IF EXISTS trigger_log_order_status_change ON public.orders;
CREATE TRIGGER trigger_log_order_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.log_order_status_change();

-- Note: Push notifications are sent from the application code (Checkout.tsx and POSDashboard.tsx)
-- This ensures better error handling and doesn't require http extension

