-- =====================================================
-- Fix RLS Issues that might be causing 406 errors
-- =====================================================

-- 1. Check current RLS status on key tables
SELECT 
    '=== RLS STATUS CHECK ===' as section,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('cafe_staff', 'orders', 'profiles', 'cafes')
ORDER BY tablename;

-- 2. Temporarily disable RLS on cafe_staff if it's causing issues
ALTER TABLE public.cafe_staff DISABLE ROW LEVEL SECURITY;

-- 3. Check if there are any problematic policies
SELECT 
    '=== PROBLEMATIC POLICIES ===' as section,
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('cafe_staff', 'orders', 'profiles')
ORDER BY tablename, policyname;

-- 4. Test basic queries after RLS fix
DO $$
BEGIN
    -- Test cafe_staff query
    PERFORM COUNT(*) FROM public.cafe_staff;
    RAISE NOTICE 'cafe_staff query works';
    
    -- Test orders query
    PERFORM COUNT(*) FROM public.orders;
    RAISE NOTICE 'orders query works';
    
    -- Test profiles query
    PERFORM COUNT(*) FROM public.profiles;
    RAISE NOTICE 'profiles query works';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Query error: %', SQLERRM;
END $$;

-- 5. Show updated RLS status
SELECT 
    '=== UPDATED RLS STATUS ===' as section,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('cafe_staff', 'orders', 'profiles', 'cafes')
ORDER BY tablename;
