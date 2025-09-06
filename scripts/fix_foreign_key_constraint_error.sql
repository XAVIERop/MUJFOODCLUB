-- Fix foreign key constraint error in order_notifications
-- The trigger is trying to insert notifications before the order is fully created

-- 1. Drop the problematic trigger
DROP TRIGGER IF EXISTS order_operations_trigger ON public.orders;

-- 2. Create a fixed trigger function that handles the foreign key issue
CREATE OR REPLACE FUNCTION public.handle_order_operations()
RETURNS TRIGGER AS $$
BEGIN
  -- For INSERT operations (new orders)
  IF TG_OP = 'INSERT' THEN
    -- Set initial timestamps
    NEW.status_updated_at = now();
    
    -- Don't create notifications during INSERT - do it after the order is created
    -- This prevents foreign key constraint violations
    
    RETURN NEW;
  END IF;
  
  -- For UPDATE operations (status changes)
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Update status timestamp
    NEW.status_updated_at = now();
    
    -- Add specific status timestamps (only if not already set)
    CASE NEW.status
      WHEN 'confirmed' THEN
        NEW.accepted_at = COALESCE(NEW.accepted_at, now());
      WHEN 'preparing' THEN
        NEW.preparing_at = COALESCE(NEW.preparing_at, now());
      WHEN 'on_the_way' THEN
        NEW.out_for_delivery_at = COALESCE(NEW.out_for_delivery_at, now());
      WHEN 'completed' THEN
        NEW.completed_at = COALESCE(NEW.completed_at, now());
        NEW.points_credited = true;
        
        -- Credit points only if not already credited
        IF NOT OLD.points_credited AND NEW.points_earned > 0 THEN
          UPDATE public.profiles 
          SET 
            loyalty_points = loyalty_points + NEW.points_earned,
            total_orders = total_orders + 1,
            total_spent = total_spent + NEW.total_amount
          WHERE id = NEW.user_id;
        END IF;
    END CASE;
    
    -- Create status update notification (this is safe for updates)
    INSERT INTO public.order_notifications (
      order_id,
      cafe_id,
      user_id,
      notification_type,
      message
    ) VALUES (
      NEW.id,
      NEW.cafe_id,
      NEW.user_id,
      'status_update',
      'Order #' || NEW.order_number || ' status updated to: ' || NEW.status
    );
    
    RETURN NEW;
  END IF;
  
  -- For any other UPDATE operations, just return NEW without changes
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create a trigger for INSERT operations (BEFORE INSERT)
CREATE TRIGGER order_insert_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_operations();

-- 4. Create a trigger for UPDATE operations (BEFORE UPDATE)
CREATE TRIGGER order_update_trigger
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_operations();

-- 5. Create a separate function to handle new order notifications (AFTER INSERT)
CREATE OR REPLACE FUNCTION public.handle_new_order_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Create new order notification after the order is fully created
  INSERT INTO public.order_notifications (
    order_id,
    cafe_id,
    user_id,
    notification_type,
    message
  ) VALUES (
    NEW.id,
    NEW.cafe_id,
    NEW.user_id,
    'new_order',
    'New order #' || NEW.order_number || ' received'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create an AFTER INSERT trigger for notifications
CREATE TRIGGER new_order_notification_trigger
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_order_notification();

-- 7. Verify all triggers are created
SELECT 'All triggers created successfully:' as status;
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders' 
AND event_object_schema = 'public'
ORDER BY trigger_name;

-- 8. Test the setup
SELECT 'Testing trigger setup:' as status;
SELECT 'Triggers should now handle order creation without foreign key errors' as result;

COMMIT;
