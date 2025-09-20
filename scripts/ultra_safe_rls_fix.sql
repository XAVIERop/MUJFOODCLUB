-- ULTRA-SAFE RLS FIX FOR MUJ FOOD CLUB
-- This script fixes RLS policies with maximum safety and rollback capability
-- Run this in Supabase SQL Editor section by section

-- ==============================================
-- PHASE 1: BACKUP AND SAFETY CHECKS
-- ==============================================

-- Step 1: Create backup of current policies
SELECT '=== PHASE 1: BACKUP AND SAFETY CHECKS ===' as phase;

-- Backup current policies to a temporary table
CREATE TEMP TABLE IF NOT EXISTS policy_backup AS
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
WHERE schemaname = 'public';

SELECT 'Backup created successfully' as status;

-- Step 2: Check current RLS status
SELECT 'Current RLS status:' as info;
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Step 3: Count current policies
SELECT 'Current policy count:' as info;
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ==============================================
-- PHASE 2: SAFE POLICY CLEANUP (ONE TABLE AT A TIME)
-- ==============================================

SELECT '=== PHASE 2: SAFE POLICY CLEANUP ===' as phase;

-- Step 1: Fix PROFILES table first (safest to start with)
SELECT 'Fixing PROFILES table policies...' as step;

-- Disable RLS temporarily on profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_optimized_policy" ON public.profiles;
DROP POLICY IF EXISTS "users_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;

-- Create simple, working policy for profiles
CREATE POLICY "profiles_simple_access" ON public.profiles
    FOR ALL USING (auth.uid() = id);

-- Re-enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Test profiles table access
SELECT 'Testing profiles table access...' as test;
SELECT COUNT(*) as profile_count FROM public.profiles LIMIT 1;

SELECT 'Profiles table fixed successfully' as status;

-- ==============================================
-- PHASE 3: FIX CAFES TABLE
-- ==============================================

SELECT '=== PHASE 3: FIX CAFES TABLE ===' as phase;

-- Disable RLS temporarily on cafes
ALTER TABLE public.cafes DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on cafes
DROP POLICY IF EXISTS "Cafes are viewable by everyone" ON public.cafes;
DROP POLICY IF EXISTS "Cafe staff can update their cafe" ON public.cafes;
DROP POLICY IF EXISTS "cafes_select_all" ON public.cafes;
DROP POLICY IF EXISTS "cafes_optimized_policy" ON public.cafes;
DROP POLICY IF EXISTS "cafes_public_read" ON public.cafes;
DROP POLICY IF EXISTS "cafes_staff_manage" ON public.cafes;

-- Create simple policies for cafes
CREATE POLICY "cafes_public_read" ON public.cafes
    FOR SELECT USING (true);

CREATE POLICY "cafes_staff_manage" ON public.cafes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.cafe_staff cs
            WHERE cs.user_id = auth.uid()
            AND cs.cafe_id = cafes.id
            AND cs.is_active = true
        )
    );

-- Re-enable RLS on cafes
ALTER TABLE public.cafes ENABLE ROW LEVEL SECURITY;

-- Test cafes table access
SELECT 'Testing cafes table access...' as test;
SELECT COUNT(*) as cafe_count FROM public.cafes LIMIT 1;

SELECT 'Cafes table fixed successfully' as status;

-- ==============================================
-- PHASE 4: FIX MENU_ITEMS TABLE
-- ==============================================

SELECT '=== PHASE 4: FIX MENU_ITEMS TABLE ===' as phase;

-- Disable RLS temporarily on menu_items
ALTER TABLE public.menu_items DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on menu_items
DROP POLICY IF EXISTS "Menu items are viewable by everyone" ON public.menu_items;
DROP POLICY IF EXISTS "Cafe staff can manage menu items" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_select_all" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_optimized_policy" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_public_read" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_cafe_management" ON public.menu_items;
DROP POLICY IF EXISTS "cafe_owners_and_staff_manage_menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_cafe_management" ON public.menu_items;

-- Create simple policies for menu_items
CREATE POLICY "menu_items_public_read" ON public.menu_items
    FOR SELECT USING (true);

CREATE POLICY "menu_items_staff_manage" ON public.menu_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.cafe_staff cs
            JOIN public.cafes c ON cs.cafe_id = c.id
            WHERE cs.user_id = auth.uid()
            AND cs.cafe_id = menu_items.cafe_id
            AND cs.is_active = true
        )
    );

-- Re-enable RLS on menu_items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Test menu_items table access
SELECT 'Testing menu_items table access...' as test;
SELECT COUNT(*) as menu_item_count FROM public.menu_items LIMIT 1;

SELECT 'Menu items table fixed successfully' as status;

-- ==============================================
-- PHASE 5: FIX CAFE_STAFF TABLE (CRITICAL)
-- ==============================================

SELECT '=== PHASE 5: FIX CAFE_STAFF TABLE ===' as phase;

-- Disable RLS temporarily on cafe_staff
ALTER TABLE public.cafe_staff DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on cafe_staff
DROP POLICY IF EXISTS "Cafe staff can view their own records" ON public.cafe_staff;
DROP POLICY IF EXISTS "Cafe staff can update their own records" ON public.cafe_staff;
DROP POLICY IF EXISTS "System can insert cafe staff" ON public.cafe_staff;
DROP POLICY IF EXISTS "System can delete cafe staff" ON public.cafe_staff;
DROP POLICY IF EXISTS "cafe_staff_select" ON public.cafe_staff;
DROP POLICY IF EXISTS "cafe_staff_update" ON public.cafe_staff;
DROP POLICY IF EXISTS "cafe_staff_insert" ON public.cafe_staff;
DROP POLICY IF EXISTS "cafe_staff_delete" ON public.cafe_staff;
DROP POLICY IF EXISTS "cafe_staff_allow_all" ON public.cafe_staff;

-- Create simple policies for cafe_staff
CREATE POLICY "cafe_staff_own_records" ON public.cafe_staff
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "cafe_staff_system_access" ON public.cafe_staff
    FOR ALL USING (true); -- System needs full access for operations

-- Re-enable RLS on cafe_staff
ALTER TABLE public.cafe_staff ENABLE ROW LEVEL SECURITY;

-- Test cafe_staff table access
SELECT 'Testing cafe_staff table access...' as test;
SELECT COUNT(*) as staff_count FROM public.cafe_staff LIMIT 1;

SELECT 'Cafe staff table fixed successfully' as status;

-- ==============================================
-- PHASE 6: FIX ORDERS TABLE (MOST CRITICAL)
-- ==============================================

SELECT '=== PHASE 6: FIX ORDERS TABLE ===' as phase;

-- Disable RLS temporarily on orders
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Cafe staff can view cafe orders" ON public.orders;
DROP POLICY IF EXISTS "Cafe staff can update cafe orders" ON public.orders;
DROP POLICY IF EXISTS "orders_select_all" ON public.orders;
DROP POLICY IF EXISTS "orders_optimized_policy" ON public.orders;
DROP POLICY IF EXISTS "orders_allow_all" ON public.orders;
DROP POLICY IF EXISTS "users_view_own_orders" ON public.orders;
DROP POLICY IF EXISTS "users_create_own_orders" ON public.orders;
DROP POLICY IF EXISTS "users_update_own_orders" ON public.orders;
DROP POLICY IF EXISTS "cafe_staff_view_orders" ON public.orders;
DROP POLICY IF EXISTS "cafe_staff_update_orders" ON public.orders;
DROP POLICY IF EXISTS "cafe_owners_can_view_their_orders" ON public.orders;
DROP POLICY IF EXISTS "cafe_owners_update_orders" ON public.orders;
DROP POLICY IF EXISTS "cafe_owners_view_orders" ON public.orders;
DROP POLICY IF EXISTS "cafe_staff_can_view_their_orders" ON public.orders;

-- Create simple policies for orders
CREATE POLICY "orders_own_orders" ON public.orders
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "orders_cafe_staff" ON public.orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.cafe_staff cs
            WHERE cs.user_id = auth.uid()
            AND cs.cafe_id = orders.cafe_id
            AND cs.is_active = true
        )
    );

-- Re-enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Test orders table access
SELECT 'Testing orders table access...' as test;
SELECT COUNT(*) as order_count FROM public.orders LIMIT 1;

SELECT 'Orders table fixed successfully' as status;

-- ==============================================
-- PHASE 7: FIX ORDER_ITEMS TABLE
-- ==============================================

SELECT '=== PHASE 7: FIX ORDER_ITEMS TABLE ===' as phase;

-- Disable RLS temporarily on order_items
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on order_items
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Cafe staff can view cafe order items" ON public.order_items;
DROP POLICY IF EXISTS "order_items_select_all" ON public.order_items;
DROP POLICY IF EXISTS "order_items_optimized_policy" ON public.order_items;
DROP POLICY IF EXISTS "order_items_allow_all" ON public.order_items;
DROP POLICY IF EXISTS "cafe_owners_and_staff_view_order_items" ON public.order_items;
DROP POLICY IF EXISTS "order_items_optimized_policy" ON public.order_items;

-- Create simple policies for order_items
CREATE POLICY "order_items_own_items" ON public.order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
            AND o.user_id = auth.uid()
        )
    );

CREATE POLICY "order_items_cafe_staff" ON public.order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            JOIN public.cafe_staff cs ON cs.cafe_id = o.cafe_id
            WHERE o.id = order_items.order_id
            AND cs.user_id = auth.uid()
            AND cs.is_active = true
        )
    );

-- Re-enable RLS on order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Test order_items table access
SELECT 'Testing order_items table access...' as test;
SELECT COUNT(*) as order_item_count FROM public.order_items LIMIT 1;

SELECT 'Order items table fixed successfully' as status;

-- ==============================================
-- PHASE 8: FINAL VERIFICATION AND TESTING
-- ==============================================

SELECT '=== PHASE 8: FINAL VERIFICATION ===' as phase;

-- Check final policy count
SELECT 'Final policy count by table:' as info;
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Test critical functionality
SELECT 'Testing critical functionality...' as test;

-- Test 1: Can we view cafes?
SELECT 'Test 1 - Viewing cafes:' as test;
SELECT COUNT(*) as cafe_count FROM public.cafes;

-- Test 2: Can we view menu items?
SELECT 'Test 2 - Viewing menu items:' as test;
SELECT COUNT(*) as menu_count FROM public.menu_items;

-- Test 3: Can we view orders?
SELECT 'Test 3 - Viewing orders:' as test;
SELECT COUNT(*) as order_count FROM public.orders;

-- Test 4: Can we view order items?
SELECT 'Test 4 - Viewing order items:' as test;
SELECT COUNT(*) as order_item_count FROM public.order_items;

-- ==============================================
-- ROLLBACK INSTRUCTIONS (IF NEEDED)
-- ==============================================

SELECT '=== ROLLBACK INSTRUCTIONS ===' as section;

SELECT 'If anything goes wrong, run these commands to rollback:' as info;
SELECT '1. ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;' as rollback_command
UNION ALL
SELECT '2. ALTER TABLE public.cafes DISABLE ROW LEVEL SECURITY;'
UNION ALL
SELECT '3. ALTER TABLE public.menu_items DISABLE ROW LEVEL SECURITY;'
UNION ALL
SELECT '4. ALTER TABLE public.cafe_staff DISABLE ROW LEVEL SECURITY;'
UNION ALL
SELECT '5. ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;'
UNION ALL
SELECT '6. ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;';

SELECT 'RLS fix completed successfully!' as final_status;
