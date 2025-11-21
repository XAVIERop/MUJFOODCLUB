-- ============================================================================
-- COMPLETE RLS POLICY RESET FOR GUEST ORDERS
-- This script completely resets all RLS policies on orders table
-- ============================================================================

-- Step 1: Drop ALL existing policies on orders table (comprehensive list)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.orders';
    END LOOP;
END $$;

-- Step 2: Verify all policies are dropped
-- (You can run this separately to check)
-- SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders';

-- Step 3: Create INSERT policy - ALLOWS GUEST ORDERS
-- This is the ONLY policy that handles INSERTs
CREATE POLICY "users_create_own_orders" ON public.orders
FOR INSERT
TO authenticated, anon
WITH CHECK (
  -- Allow authenticated users to create orders with their own user_id
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  -- Allow guest orders where user_id IS NULL
  (user_id IS NULL)
);

-- Step 4: Create SELECT policies
-- Cafe staff can view all orders for their cafe
CREATE POLICY "orders_cafe_staff_select" ON public.orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM cafe_staff cs
    WHERE cs.user_id = auth.uid()
      AND cs.cafe_id = orders.cafe_id
      AND cs.is_active = true
  )
);

-- Users can view their own orders
CREATE POLICY "orders_own_orders_select" ON public.orders
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

-- Step 5: Create UPDATE policies
-- Cafe staff can update orders for their cafe
CREATE POLICY "orders_cafe_staff_update" ON public.orders
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM cafe_staff cs
    WHERE cs.user_id = auth.uid()
      AND cs.cafe_id = orders.cafe_id
      AND cs.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM cafe_staff cs
    WHERE cs.user_id = auth.uid()
      AND cs.cafe_id = orders.cafe_id
      AND cs.is_active = true
  )
);

-- Users can update their own orders
CREATE POLICY "orders_own_orders_update" ON public.orders
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 6: Verify the new policies
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'orders'
ORDER BY cmd, policyname;

