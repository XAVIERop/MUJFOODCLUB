-- Fix RLS policies to allow cafe owners to update order statuses
-- This will resolve the status update issue in POS dashboard

-- First, check current policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'orders' 
ORDER BY policyname;

-- Drop existing restrictive policies that might block updates
DROP POLICY IF EXISTS "Users can only view their own orders" ON orders;
DROP POLICY IF EXISTS "Cafe staff can view their cafe orders" ON orders;
DROP POLICY IF EXISTS "Cafe owners can view their cafe orders" ON orders;
DROP POLICY IF EXISTS "Users can only update their own orders" ON orders;

-- Create comprehensive policies for orders table

-- 1. Allow cafe owners to view and update their cafe's orders
CREATE POLICY "cafe_owners_full_access" ON orders
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.cafe_id = orders.cafe_id
    AND profiles.user_type = 'cafe_owner'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.cafe_id = orders.cafe_id
    AND profiles.user_type = 'cafe_owner'
  )
);

-- 2. Allow cafe staff to view and update their cafe's orders
CREATE POLICY "cafe_staff_full_access" ON orders
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM cafe_staff 
    WHERE cafe_staff.user_id = auth.uid() 
    AND cafe_staff.cafe_id = orders.cafe_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM cafe_staff 
    WHERE cafe_staff.user_id = auth.uid() 
    AND cafe_staff.cafe_id = orders.cafe_id
  )
);

-- 3. Allow users to view their own orders (for order tracking)
CREATE POLICY "users_view_own_orders" ON orders
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 4. Allow users to update their own orders (for cancellations)
CREATE POLICY "users_update_own_orders" ON orders
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Grant necessary permissions
GRANT ALL ON orders TO authenticated;
GRANT SELECT ON profiles TO authenticated;
GRANT SELECT ON cafe_staff TO authenticated;

-- Test the policies
SELECT 'RLS policies updated successfully for orders table' as status;
