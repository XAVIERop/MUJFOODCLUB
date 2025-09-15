-- =====================================================
-- Check RPC Functions After Simplification
-- =====================================================

-- 1. Check if get_cafes_ordered function exists
SELECT 
    '=== GET_CAFES_ORDERED FUNCTION ===' as section,
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name = 'get_cafes_ordered';

-- 2. List all RPC functions
SELECT 
    '=== ALL RPC FUNCTIONS ===' as section,
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 3. Test the get_cafes_ordered function directly
SELECT 
    '=== TESTING GET_CAFES_ORDERED ===' as section,
    'Testing function call...' as status;

-- This will show the actual function result
SELECT * FROM get_cafes_ordered();

-- 4. Check if there are any issues with the function
SELECT 
    '=== FUNCTION STATUS ===' as section,
    'Function exists and should be callable' as status;
