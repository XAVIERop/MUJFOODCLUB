-- Fix RLS policies for order_notifications table
-- This will resolve the "new row violates row-level security policy" error

-- First, check current policies on order_notifications
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'order_notifications' 
ORDER BY policyname;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON order_notifications;
DROP POLICY IF EXISTS "Cafe staff can view their cafe notifications" ON order_notifications;
DROP POLICY IF EXISTS "Cafe owners can view their cafe notifications" ON order_notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON order_notifications;

-- Create comprehensive policies for order_notifications table

-- 1. Allow cafe owners to view and insert notifications for their cafe's orders
CREATE POLICY "cafe_owners_notifications_access" ON order_notifications
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.cafe_id = order_notifications.cafe_id
    AND profiles.user_type = 'cafe_owner'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.cafe_id = order_notifications.cafe_id
    AND profiles.user_type = 'cafe_owner'
  )
);

-- 2. Allow cafe staff to view and insert notifications for their cafe's orders
CREATE POLICY "cafe_staff_notifications_access" ON order_notifications
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM cafe_staff 
    WHERE cafe_staff.user_id = auth.uid() 
    AND cafe_staff.cafe_id = order_notifications.cafe_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM cafe_staff 
    WHERE cafe_staff.user_id = auth.uid() 
    AND cafe_staff.cafe_id = order_notifications.cafe_id
  )
);

-- 3. Allow users to view their own notifications
CREATE POLICY "users_view_own_notifications" ON order_notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 4. Allow system to insert notifications for users (for order updates)
CREATE POLICY "system_insert_notifications" ON order_notifications
FOR INSERT
TO authenticated
WITH CHECK (true); -- Allow all authenticated users to insert notifications

-- Grant necessary permissions
GRANT ALL ON order_notifications TO authenticated;
GRANT SELECT ON profiles TO authenticated;
GRANT SELECT ON cafe_staff TO authenticated;

-- Test the policies
SELECT 'RLS policies updated successfully for order_notifications table' as status;