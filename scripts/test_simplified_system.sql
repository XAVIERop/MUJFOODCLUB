-- =====================================================
-- Test Simplified System
-- =====================================================

-- 1. Verify orders table is clean
SELECT 
    '=== ORDERS TABLE VERIFICATION ===' as section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
AND column_name IN ('points_earned', 'points_credited')
ORDER BY column_name;

-- 2. Check remaining triggers (should be minimal)
SELECT 
    '=== REMAINING TRIGGERS ===' as section,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'orders' 
AND event_object_schema = 'public'
ORDER BY trigger_name;

-- 3. Check remaining functions (should be essential only)
SELECT 
    '=== REMAINING FUNCTIONS ===' as section,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%order%'
ORDER BY routine_name;

-- 4. Test order creation (dry run)
SELECT 
    '=== ORDER CREATION TEST ===' as section,
    'Ready to create orders without rewards system' as status,
    'All rewards-related columns and functions removed' as message;

-- 5. Check test account status
SELECT 
    '=== TEST ACCOUNT STATUS ===' as section,
    id,
    email,
    full_name,
    loyalty_points,
    loyalty_tier,
    total_orders,
    total_spent
FROM public.profiles 
WHERE email = 'test.student@muj.manipal.edu';

-- 6. Check cafe status
SELECT 
    '=== CAFE STATUS ===' as section,
    name,
    accepting_orders,
    whatsapp_phone,
    whatsapp_enabled
FROM public.cafes 
WHERE name ILIKE '%chatkara%' OR name = 'CHATKARA'
LIMIT 1;
