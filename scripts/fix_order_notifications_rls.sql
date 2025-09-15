-- Fix Order Notifications RLS Policy Issue
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Check current RLS policies on order_notifications
SELECT 
  '=== CURRENT RLS POLICIES ===' as section,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'order_notifications'
ORDER BY policyname;

-- 2. Check if RLS is enabled
SELECT 
  '=== RLS STATUS ===' as section,
  relname as table_name,
  relrowsecurity as rls_enabled
FROM pg_class 
WHERE relname = 'order_notifications';

-- 3. Fix the RLS policies for order_notifications
-- Drop existing conflicting policies
DROP POLICY IF EXISTS "notifications_select" ON public.order_notifications;
DROP POLICY IF EXISTS "notifications_insert" ON public.order_notifications;
DROP POLICY IF EXISTS "notifications_update" ON public.order_notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.order_notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.order_notifications;
DROP POLICY IF EXISTS "notifications_final" ON public.order_notifications;

-- 4. Create proper RLS policies
-- Allow users to view their own notifications
CREATE POLICY "order_notifications_select_policy" ON public.order_notifications
  FOR SELECT USING (
    (SELECT auth.uid()) = user_id OR
    EXISTS (
      SELECT 1 FROM public.cafe_staff cs
      WHERE cs.cafe_id = order_notifications.cafe_id
      AND cs.user_id = (SELECT auth.uid())
      AND cs.is_active = true
    )
  );

-- Allow system to insert notifications (for triggers)
CREATE POLICY "order_notifications_insert_policy" ON public.order_notifications
  FOR INSERT WITH CHECK (true);

-- Allow users to update their own notifications (mark as read)
CREATE POLICY "order_notifications_update_policy" ON public.order_notifications
  FOR UPDATE USING (
    (SELECT auth.uid()) = user_id
  );

-- 5. Ensure RLS is enabled
ALTER TABLE public.order_notifications ENABLE ROW LEVEL SECURITY;

-- 6. Verify the fix
SELECT 
  '=== VERIFICATION ===' as section,
  'RLS Policies Fixed' as status,
  'Order notifications should now work properly' as message;

-- 7. Test the policies
SELECT 
  '=== POLICY VERIFICATION ===' as section,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'order_notifications'
ORDER BY policyname;
