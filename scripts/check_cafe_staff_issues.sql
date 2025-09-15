-- =====================================================
-- Check cafe_staff table issues causing 406 errors
-- =====================================================

-- 1. Check if cafe_staff table exists and its structure
SELECT 
    '=== CAFE_STAFF TABLE STRUCTURE ===' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cafe_staff' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check RLS policies on cafe_staff table
SELECT 
    '=== CAFE_STAFF RLS POLICIES ===' as section,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'cafe_staff' 
AND schemaname = 'public';

-- 3. Check if RLS is enabled on cafe_staff
SELECT 
    '=== CAFE_STAFF RLS STATUS ===' as section,
    relname as table_name,
    relrowsecurity as rls_enabled
FROM pg_class 
WHERE relname = 'cafe_staff' 
AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 4. Test simple query on cafe_staff
SELECT 
    '=== CAFE_STAFF DATA TEST ===' as section,
    COUNT(*) as total_records
FROM public.cafe_staff;

-- 5. Check specific cafe_staff records
SELECT 
    '=== CAFE_STAFF RECORDS ===' as section,
    cafe_id,
    user_id,
    role,
    is_active
FROM public.cafe_staff 
LIMIT 5;
