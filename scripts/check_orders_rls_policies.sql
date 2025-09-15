-- Check RLS policies for orders table to see if updates are allowed
-- This will help debug why status updates might not be working

-- Check current RLS policies on orders table
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

-- Check if RLS is enabled on orders table
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'orders';

-- Test if we can update an order (this will show if RLS is blocking updates)
-- First, let's see what orders exist for Chatkara
SELECT 
  id, 
  order_number, 
  status, 
  created_at 
FROM orders 
WHERE cafe_id = '25d0b247-0731-4e52-a0fb-023526adfa34'
ORDER BY created_at DESC 
LIMIT 3;
