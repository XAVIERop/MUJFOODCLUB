-- Fix both POS Dashboard order visibility and status reversion issues
-- This script addresses the root causes of both problems

-- 1. First, let's check what triggers currently exist
SELECT 'Current triggers on orders table:' as status;
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders' 
AND event_object_schema = 'public';

-- 2. Drop ALL existing triggers to start fresh
DROP TRIGGER IF EXISTS consolidated_order_update_trigger ON public.orders;
DROP TRIGGER IF EXISTS order_status_update_trigger ON public.orders;
DROP TRIGGER IF EXISTS queue_management_trigger ON public.orders;
DROP TRIGGER IF EXISTS order_analytics_trigger ON public.orders;
DROP TRIGGER IF EXISTS item_analytics_trigger ON public.orders;
DROP TRIGGER IF EXISTS new_order_notification_trigger ON public.orders;

-- 3. Create a simple, clean trigger function that only handles what's necessary
CREATE OR REPLACE FUNCTION public.handle_order_operations()
RETURNS TRIGGER AS $$
BEGIN
  -- For INSERT operations (new orders)
  IF TG_OP = 'INSERT' THEN
    -- Set initial timestamps
    NEW.status_updated_at = now();
    
    -- Create new order notification
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
    
    -- Create status update notification
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

-- 4. Create a single, simple trigger
CREATE TRIGGER order_operations_trigger
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_operations();

-- 5. Verify the new trigger is created
SELECT 'New simple trigger created:' as status;
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders' 
AND event_object_schema = 'public'
AND trigger_name = 'order_operations_trigger';

-- 6. Check Food Court owner setup to ensure POS Dashboard can see orders
SELECT 'Food Court owner verification:' as status;
SELECT 
  p.email,
  p.full_name,
  p.user_type,
  p.cafe_id,
  c.name as cafe_name,
  cs.role as staff_role,
  cs.is_active as staff_active
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
LEFT JOIN public.cafe_staff cs ON cs.user_id = p.id AND cs.cafe_id = c.id
WHERE p.email = 'foodcourt.owner@mujfoodclub.in';

-- 7. Test recent Food Court orders
SELECT 'Recent Food Court orders:' as status;
SELECT 
  o.id,
  o.order_number,
  o.status,
  o.total_amount,
  o.created_at,
  c.name as cafe_name
FROM public.orders o
JOIN public.cafes c ON o.cafe_id = c.id
WHERE c.name = 'FOOD COURT'
ORDER BY o.created_at DESC
LIMIT 5;

-- 8. Check if there are any RLS policies that might be blocking POS Dashboard access
SELECT 'RLS policies on orders table:' as status;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'orders' AND schemaname = 'public';

COMMIT;
