-- Fix order status reversion issue
-- This script consolidates and fixes all conflicting triggers on the orders table

-- 1. First, let's see what triggers currently exist
SELECT 'Current triggers on orders table:' as status;
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders' 
AND event_object_schema = 'public';

-- 2. Drop all existing conflicting triggers
DROP TRIGGER IF EXISTS order_status_update_trigger ON public.orders;
DROP TRIGGER IF EXISTS queue_management_trigger ON public.orders;
DROP TRIGGER IF EXISTS order_analytics_trigger ON public.orders;
DROP TRIGGER IF EXISTS item_analytics_trigger ON public.orders;

-- 3. Create a single, consolidated trigger function that handles everything properly
CREATE OR REPLACE FUNCTION public.handle_order_update_consolidated()
RETURNS TRIGGER AS $$
DECLARE
  order_date DATE;
  item_date DATE;
BEGIN
  -- Only process if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    
    -- Update status timestamps based on new status
    CASE NEW.status
      WHEN 'confirmed' THEN
        NEW.accepted_at = COALESCE(NEW.accepted_at, now());
        NEW.status_updated_at = now();
      WHEN 'preparing' THEN
        NEW.preparing_at = COALESCE(NEW.preparing_at, now());
        NEW.status_updated_at = now();
      WHEN 'on_the_way' THEN
        NEW.out_for_delivery_at = COALESCE(NEW.out_for_delivery_at, now());
        NEW.status_updated_at = now();
      WHEN 'completed' THEN
        NEW.completed_at = COALESCE(NEW.completed_at, now());
        NEW.status_updated_at = now();
        NEW.points_credited = true;
        
        -- Credit points only when order is completed and not already credited
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
    
    -- Update order queue if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_queue') THEN
      IF NEW.status = 'confirmed' THEN
        UPDATE public.order_queue 
        SET status = 'processing', started_at = now()
        WHERE order_id = NEW.id;
      ELSIF NEW.status IN ('completed', 'cancelled') THEN
        UPDATE public.order_queue 
        SET status = 'completed', completed_at = now()
        WHERE order_id = NEW.id;
      END IF;
    END IF;
  END IF;
  
  -- Handle analytics updates (only for new orders or status changes to completed)
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed') THEN
    order_date := date(NEW.created_at);
    
    -- Update order analytics
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_analytics') THEN
      INSERT INTO public.order_analytics (
        cafe_id, date, total_orders, total_revenue, completed_orders, 
        cancelled_orders, average_order_value
      )
      SELECT 
        NEW.cafe_id,
        order_date,
        COUNT(*),
        SUM(total_amount),
        COUNT(*) FILTER (WHERE status = 'completed'),
        COUNT(*) FILTER (WHERE status = 'cancelled'),
        AVG(total_amount)
      FROM public.orders 
      WHERE cafe_id = NEW.cafe_id AND date(created_at) = order_date
      ON CONFLICT (cafe_id, date) DO UPDATE SET
        total_orders = EXCLUDED.total_orders,
        total_revenue = EXCLUDED.total_revenue,
        completed_orders = EXCLUDED.completed_orders,
        cancelled_orders = EXCLUDED.cancelled_orders,
        average_order_value = EXCLUDED.average_order_value,
        updated_at = now();
    END IF;
    
    -- Update item analytics (only for new orders)
    IF TG_OP = 'INSERT' AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'item_analytics') THEN
      item_date := date(NEW.created_at);
      
      INSERT INTO public.item_analytics (
        cafe_id, menu_item_id, date, quantity_sold, revenue_generated, times_ordered
      )
      SELECT 
        NEW.cafe_id,
        oi.menu_item_id,
        item_date,
        oi.quantity,
        oi.quantity * mi.price,
        1
      FROM public.order_items oi
      JOIN public.menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = NEW.id
      ON CONFLICT (cafe_id, menu_item_id, date) DO UPDATE SET
        quantity_sold = item_analytics.quantity_sold + EXCLUDED.quantity_sold,
        revenue_generated = item_analytics.revenue_generated + EXCLUDED.revenue_generated,
        times_ordered = item_analytics.times_ordered + EXCLUDED.times_ordered,
        updated_at = now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create a single trigger that handles all order updates
CREATE TRIGGER consolidated_order_update_trigger
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_update_consolidated();

-- 5. Verify the new trigger is created
SELECT 'New consolidated trigger created:' as status;
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders' 
AND event_object_schema = 'public'
AND trigger_name = 'consolidated_order_update_trigger';

-- 6. Test the fix by checking a recent order
SELECT 'Testing with recent Food Court orders:' as status;
SELECT 
  id,
  order_number,
  status,
  accepted_at,
  preparing_at,
  out_for_delivery_at,
  completed_at,
  points_credited,
  status_updated_at
FROM public.orders 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = 'FOOD COURT')
ORDER BY created_at DESC
LIMIT 3;

COMMIT;
