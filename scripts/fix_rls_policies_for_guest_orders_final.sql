-- ============================================================================
-- COMPREHENSIVE RLS POLICY FIX FOR GUEST ORDERS
-- This script fixes the RLS policies to allow guest orders (user_id IS NULL)
-- ============================================================================

-- Step 1: Drop ALL existing policies on orders table that might interfere
DROP POLICY IF EXISTS "orders_cafe_staff" ON public.orders;
DROP POLICY IF EXISTS "orders_own_orders" ON public.orders;
DROP POLICY IF EXISTS "orders_cafe_staff_select" ON public.orders;
DROP POLICY IF EXISTS "orders_cafe_staff_update" ON public.orders;
DROP POLICY IF EXISTS "orders_own_orders_select" ON public.orders;
DROP POLICY IF EXISTS "orders_own_orders_update" ON public.orders;
DROP POLICY IF EXISTS "users_create_own_orders" ON public.orders;

-- Step 2: Create the INSERT policy that allows guest orders
-- This is the ONLY policy that should handle INSERTs
CREATE POLICY "users_create_own_orders" ON public.orders
FOR INSERT
TO authenticated, anon
WITH CHECK (
  -- Allow if user is authenticated and user_id matches their auth.uid()
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  -- Allow if user_id IS NULL (guest orders)
  (user_id IS NULL)
);

-- Step 3: Create SELECT policies for viewing orders
-- Cafe staff can view orders for their cafe
CREATE POLICY "orders_cafe_staff_select" ON public.orders
FOR SELECT
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
USING (
  -- Authenticated users can see their own orders
  auth.uid() IS NOT NULL AND user_id = auth.uid()
);

-- Step 4: Create UPDATE policies for modifying orders
-- Cafe staff can update orders for their cafe
CREATE POLICY "orders_cafe_staff_update" ON public.orders
FOR UPDATE
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

-- Users can update their own orders (only authenticated users)
CREATE POLICY "orders_own_orders_update" ON public.orders
FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Step 5: Verify the policies
-- Run this query to see all policies on orders table:
-- SELECT policyname, cmd, roles, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'orders'
-- ORDER BY cmd, policyname;

