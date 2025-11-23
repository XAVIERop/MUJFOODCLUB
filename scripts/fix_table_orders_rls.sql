-- Fix RLS policies to allow guest/table orders where user_id is NULL
-- This will resolve the "new row violates row-level security policy" error for table orders

-- 1. First, check current policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'orders' 
ORDER BY policyname;

-- 2. Drop the restrictive INSERT policy that's blocking guest orders
DROP POLICY IF EXISTS "users_create_own_orders" ON public.orders;

-- 3. Create new INSERT policy that allows BOTH authenticated user orders AND guest orders
CREATE POLICY "users_and_guests_create_orders" ON public.orders
  FOR INSERT 
  WITH CHECK (
    -- Allow if user is creating their own order (authenticated)
    auth.uid() = user_id
    OR
    -- Allow if it's a guest order (user_id is NULL for table orders and guest checkouts)
    user_id IS NULL
  );

-- 4. Verify the new policy
SELECT 
  policyname, 
  cmd, 
  with_check
FROM pg_policies 
WHERE tablename = 'orders' 
AND policyname = 'users_and_guests_create_orders';

-- 5. Test result
SELECT 'RLS policy updated successfully! Guest/table orders are now allowed.' as status;

