-- Comprehensive fix for RLS policies to allow guest orders
-- This script drops all conflicting policies and creates clean ones

-- =====================================================
-- STEP 1: DROP ALL EXISTING INSERT POLICIES ON ORDERS
-- =====================================================

DROP POLICY IF EXISTS "users_create_own_orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_all" ON public.orders;
DROP POLICY IF EXISTS "orders_debug_insert" ON public.orders;

-- =====================================================
-- STEP 2: CREATE SINGLE INSERT POLICY FOR ORDERS
-- =====================================================

-- This policy allows:
-- 1. Authenticated users to create orders with their own user_id
-- 2. Anyone (including unauthenticated/anonymous) to create guest orders (user_id IS NULL)
CREATE POLICY "users_create_own_orders" ON public.orders
  FOR INSERT 
  TO authenticated, anon
  WITH CHECK (
    -- Allow if user is authenticated and user_id matches
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    -- Allow guest orders (user_id IS NULL) - for both authenticated and unauthenticated users
    -- This enables Banna's Chowki dine-in guest ordering
    (user_id IS NULL)
  );

-- =====================================================
-- STEP 3: FIX ORDER_ITEMS POLICIES FOR GUEST ORDERS
-- =====================================================

-- Drop existing INSERT policies on order_items
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert_all" ON public.order_items;

-- Create new INSERT policy that allows order items for guest orders
-- This policy allows:
-- 1. Order items for orders where user_id matches auth.uid()
-- 2. Order items for guest orders (where order.user_id IS NULL)
CREATE POLICY "users_create_order_items" ON public.order_items
  FOR INSERT 
  TO authenticated, anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (
        -- Allow if order belongs to authenticated user
        (auth.uid() IS NOT NULL AND orders.user_id = auth.uid())
        OR
        -- Allow if order is a guest order (user_id IS NULL)
        (orders.user_id IS NULL)
      )
    )
  );

-- =====================================================
-- STEP 4: VERIFY POLICIES WERE CREATED
-- =====================================================

-- Check orders INSERT policies
SELECT 
  'Orders INSERT Policies' as policy_type,
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'orders' 
AND cmd = 'INSERT'
AND schemaname = 'public';

-- Check order_items INSERT policies
SELECT 
  'Order Items INSERT Policies' as policy_type,
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'order_items' 
AND cmd = 'INSERT'
AND schemaname = 'public';

-- =====================================================
-- STEP 5: VERIFY COLUMN NULLABILITY
-- =====================================================

SELECT 
  'Column Status' as status,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'user_id'
AND table_schema = 'public';

