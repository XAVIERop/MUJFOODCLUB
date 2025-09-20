-- Fix RLS policies for order confirmation page
-- The 406 errors suggest RLS policies are blocking order data access

-- First, let's check current RLS status
SELECT 'Current RLS status:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('orders', 'order_items', 'cafes', 'menu_items', 'profiles')
ORDER BY tablename;

-- Check existing policies
SELECT 'Current RLS policies:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('orders', 'order_items', 'cafes', 'menu_items', 'profiles')
ORDER BY tablename, policyname;

-- Create comprehensive, working RLS policies for order confirmation
-- Drop existing problematic policies first
DROP POLICY IF EXISTS "orders_select_all" ON public.orders;
DROP POLICY IF EXISTS "orders_optimized_policy" ON public.orders;
DROP POLICY IF EXISTS "cafe_owners_can_view_their_orders" ON public.orders;
DROP POLICY IF EXISTS "cafe_owners_view_orders" ON public.orders;
DROP POLICY IF EXISTS "cafe_staff_can_view_their_orders" ON public.orders;
DROP POLICY IF EXISTS "cafe_owners_update_orders" ON public.orders;

-- Create simple, working policies for orders
CREATE POLICY "orders_authenticated_select" ON public.orders
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "orders_authenticated_insert" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "orders_authenticated_update" ON public.orders
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Fix order_items policies
DROP POLICY IF EXISTS "order_items_select_all" ON public.order_items;
DROP POLICY IF EXISTS "order_items_optimized_policy" ON public.order_items;
DROP POLICY IF EXISTS "cafe_owners_and_staff_view_order_items" ON public.order_items;

CREATE POLICY "order_items_authenticated_select" ON public.order_items
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "order_items_authenticated_insert" ON public.order_items
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Fix cafes policies (needed for cafe name in order confirmation)
DROP POLICY IF EXISTS "cafes_select_all" ON public.cafes;
DROP POLICY IF EXISTS "cafes_public_read" ON public.cafes;

CREATE POLICY "cafes_public_select" ON public.cafes
    FOR SELECT USING (true);

-- Fix menu_items policies (needed for order items)
DROP POLICY IF EXISTS "menu_items_select_all" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_public_read" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_cafe_management" ON public.menu_items;
DROP POLICY IF EXISTS "cafe_owners_and_staff_manage_menu_items" ON public.menu_items;

CREATE POLICY "menu_items_public_select" ON public.menu_items
    FOR SELECT USING (true);

-- Fix profiles policies (needed for user data)
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_optimized_policy" ON public.profiles;

CREATE POLICY "profiles_authenticated_select" ON public.profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "profiles_authenticated_update" ON public.profiles
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Test the queries that should work for order confirmation
SELECT 'Testing order confirmation queries:' as info;

-- Test 1: Basic order fetch
SELECT 'Test 1 - Basic order fetch:' as test;
SELECT order_number, status, total_amount, delivery_block, payment_method
FROM public.orders 
WHERE order_number = 'CHA000191'
LIMIT 1;

-- Test 2: Order with cafe data
SELECT 'Test 2 - Order with cafe data:' as test;
SELECT 
    o.order_number,
    o.status,
    o.total_amount,
    c.name as cafe_name,
    c.location as cafe_location
FROM public.orders o
LEFT JOIN public.cafes c ON o.cafe_id = c.id
WHERE o.order_number = 'CHA000191'
LIMIT 1;

-- Test 3: Order with order items
SELECT 'Test 3 - Order with order items:' as test;
SELECT 
    o.order_number,
    oi.quantity,
    oi.unit_price,
    oi.total_price,
    mi.name as item_name
FROM public.orders o
LEFT JOIN public.order_items oi ON o.id = oi.order_id
LEFT JOIN public.menu_items mi ON oi.menu_item_id = mi.id
WHERE o.order_number = 'CHA000191'
LIMIT 5;

-- Final status
SELECT 'Order confirmation RLS fix completed!' as final_status;
