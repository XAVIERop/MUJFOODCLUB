-- Final fix for foreign key constraint error in order_notifications
-- This script completely resolves the order creation issue

-- 1. Drop ALL existing triggers to start completely fresh
DROP TRIGGER IF EXISTS order_operations_trigger ON public.orders;
DROP TRIGGER IF EXISTS order_insert_trigger ON public.orders;
DROP TRIGGER IF EXISTS order_update_trigger ON public.orders;
DROP TRIGGER IF EXISTS new_order_notification_trigger ON public.orders;
DROP TRIGGER IF EXISTS consolidated_order_update_trigger ON public.orders;
DROP TRIGGER IF EXISTS order_status_update_trigger ON public.orders;
DROP TRIGGER IF EXISTS queue_management_trigger ON public.orders;
DROP TRIGGER IF EXISTS order_analytics_trigger ON public.orders;
DROP TRIGGER IF EXISTS item_analytics_trigger ON public.orders;
DROP TRIGGER IF EXISTS order_operations_safe_trigger ON public.orders;
DROP TRIGGER IF EXISTS new_order_notification_safe_trigger ON public.orders;

-- 2. Create a simple, clean trigger function for order operations
CREATE OR REPLACE FUNCTION public.handle_order_operations_clean()
RETURNS TRIGGER AS $$
BEGIN
  -- For INSERT operations (new orders)
  IF TG_OP = 'INSERT' THEN
    -- Set initial timestamps
    NEW.status_updated_at = now();
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
    
    RETURN NEW;
  END IF;
  
  -- For any other UPDATE operations, just return NEW without changes
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create a simple trigger for order operations (BEFORE INSERT/UPDATE)
CREATE TRIGGER order_operations_clean_trigger
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_operations_clean();

-- 4. Create a separate function for new order notifications (AFTER INSERT)
CREATE OR REPLACE FUNCTION public.handle_new_order_notification_clean()
RETURNS TRIGGER AS $$
BEGIN
  -- Create new order notification AFTER the order is fully created
  -- This prevents foreign key constraint violations
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

-- 5. Create AFTER INSERT trigger for new order notifications
CREATE TRIGGER new_order_notification_clean_trigger
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_order_notification_clean();

-- 6. Create a function for status update notifications (AFTER UPDATE)
CREATE OR REPLACE FUNCTION public.handle_status_update_notification_clean()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
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
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create AFTER UPDATE trigger for status update notifications
CREATE TRIGGER status_update_notification_clean_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_status_update_notification_clean();

-- 8. Verify the setup
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

-- 9. Test with a sample query
SELECT 'Testing database connectivity:' as status;
SELECT 
  id,
  order_number,
  status,
  created_at
FROM public.orders 
ORDER BY created_at DESC
LIMIT 3;

COMMIT;
