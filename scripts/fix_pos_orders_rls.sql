-- Fix RLS policies for POS dashboard orders
-- The issue: RLS policies are blocking order queries for cafe owners

-- First, check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'orders';

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can only view their own orders" ON orders;
DROP POLICY IF EXISTS "Cafe staff can view their cafe orders" ON orders;
DROP POLICY IF EXISTS "Cafe owners can view their cafe orders" ON orders;

-- Create a simple, working policy for cafe owners
CREATE POLICY "cafe_owners_can_view_their_orders" ON orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.cafe_id = orders.cafe_id
    AND profiles.user_type = 'cafe_owner'
  )
);

-- Also allow cafe staff to view their cafe orders
CREATE POLICY "cafe_staff_can_view_their_orders" ON orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM cafe_staff 
    WHERE cafe_staff.user_id = auth.uid() 
    AND cafe_staff.cafe_id = orders.cafe_id
  )
);

-- Grant necessary permissions
GRANT SELECT ON orders TO authenticated;
GRANT SELECT ON profiles TO authenticated;
GRANT SELECT ON cafe_staff TO authenticated;

-- Test the policy
SELECT 'RLS policies updated successfully' as status;
