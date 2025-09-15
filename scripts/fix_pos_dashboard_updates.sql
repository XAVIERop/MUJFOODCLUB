-- Fix POS Dashboard Order Update Issues
-- This script addresses potential database issues preventing real-time order updates

-- =====================================================
-- 1. CHECK AND FIX ORDER NOTIFICATIONS TABLE
-- =====================================================

-- Ensure order_notifications table exists and has proper structure
CREATE TABLE IF NOT EXISTS public.order_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  cafe_id UUID NOT NULL REFERENCES public.cafes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL DEFAULT 'new_order',
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal',
  category TEXT NOT NULL DEFAULT 'order',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on order_notifications
ALTER TABLE public.order_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for order_notifications
DROP POLICY IF EXISTS "Cafe staff can view their notifications" ON public.order_notifications;
CREATE POLICY "Cafe staff can view their notifications" ON public.order_notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.cafe_staff 
            WHERE cafe_staff.cafe_id = order_notifications.cafe_id 
            AND cafe_staff.user_id = (SELECT auth.uid())
        )
    );

-- =====================================================
-- 2. FIX ORDER TRIGGERS
-- =====================================================

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS multiple_orders_trigger ON public.orders;

-- Create a simplified, reliable trigger for order notifications
CREATE OR REPLACE FUNCTION public.handle_new_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for cafe staff
  INSERT INTO public.order_notifications (
    order_id,
    cafe_id,
    user_id,
    notification_type,
    message,
    priority,
    category
  ) VALUES (
    NEW.id,
    NEW.cafe_id,
    NEW.user_id,
    'new_order',
    'New order #' || NEW.order_number || ' received',
    'high',
    'order'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER new_order_notification_trigger
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_order();

-- =====================================================
-- 3. FIX ORDER QUEUE TABLE (if needed)
-- =====================================================

-- Ensure order_queue table exists
CREATE TABLE IF NOT EXISTS public.order_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  cafe_id UUID NOT NULL REFERENCES public.cafes(id) ON DELETE CASCADE,
  queue_position INTEGER NOT NULL,
  priority_level TEXT NOT NULL DEFAULT 'normal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on order_queue
ALTER TABLE public.order_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for order_queue
DROP POLICY IF EXISTS "Cafe staff can view their queue" ON public.order_queue;
CREATE POLICY "Cafe staff can view their queue" ON public.order_queue
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.cafe_staff 
            WHERE cafe_staff.cafe_id = order_queue.cafe_id 
            AND cafe_staff.user_id = (SELECT auth.uid())
        )
    );

-- =====================================================
-- 4. ADD DEBUGGING FUNCTIONS
-- =====================================================

-- Function to check if orders are being created
CREATE OR REPLACE FUNCTION public.debug_recent_orders()
RETURNS TABLE (
  order_id UUID,
  order_number TEXT,
  cafe_id UUID,
  status TEXT,
  created_at TIMESTAMPTZ,
  has_notification BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.order_number,
    o.cafe_id,
    o.status,
    o.created_at,
    EXISTS(
      SELECT 1 FROM public.order_notifications n 
      WHERE n.order_id = o.id
    ) as has_notification
  FROM public.orders o
  WHERE o.created_at >= NOW() - INTERVAL '1 hour'
  ORDER BY o.created_at DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check cafe staff assignments
CREATE OR REPLACE FUNCTION public.debug_cafe_staff(cafe_uuid UUID)
RETURNS TABLE (
  staff_id UUID,
  cafe_id UUID,
  user_email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.user_id,
    cs.cafe_id,
    p.email
  FROM public.cafe_staff cs
  JOIN public.profiles p ON p.id = cs.user_id
  WHERE cs.cafe_id = cafe_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions for debugging functions
GRANT EXECUTE ON FUNCTION public.debug_recent_orders() TO authenticated;
GRANT EXECUTE ON FUNCTION public.debug_cafe_staff(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.debug_cafe_staff(UUID) TO anon;

-- =====================================================
-- 6. CREATE TEST DATA (if needed)
-- =====================================================

-- Insert a test notification to verify the system works
-- (This will be cleaned up automatically due to foreign key constraints)
INSERT INTO public.order_notifications (
  order_id,
  cafe_id,
  user_id,
  notification_type,
  message,
  priority,
  category
) VALUES (
  (SELECT id FROM public.orders ORDER BY created_at DESC LIMIT 1),
  (SELECT id FROM public.cafes ORDER BY created_at DESC LIMIT 1),
  (SELECT id FROM public.profiles ORDER BY created_at DESC LIMIT 1),
  'test',
  'Test notification to verify system',
  'normal',
  'test'
) ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. VERIFY SETUP
-- =====================================================

-- Check if all tables exist and have proper structure
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('orders', 'order_notifications', 'order_queue', 'cafe_staff')
ORDER BY table_name, ordinal_position;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('orders', 'order_notifications', 'order_queue', 'cafe_staff')
ORDER BY tablename, policyname;
