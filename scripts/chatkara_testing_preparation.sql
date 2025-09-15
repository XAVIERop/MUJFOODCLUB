-- =====================================================
-- Chatkara Testing Preparation & Rewards System Check
-- =====================================================

-- 1. Check Chatkara current status
SELECT 
    '=== CHATKARA CAFE STATUS ===' as section,
    id,
    name,
    whatsapp_phone,
    whatsapp_enabled,
    whatsapp_notifications,
    is_active,
    accepting_orders
FROM public.cafes 
WHERE name ILIKE '%chatkara%' OR name = 'CHATKARA';

-- 2. Check Chatkara owner account
SELECT 
    '=== CHATKARA OWNER ACCOUNT ===' as section,
    p.id,
    p.email,
    p.full_name,
    p.user_type,
    p.cafe_id,
    c.name as cafe_name,
    au.email_confirmed_at,
    au.last_sign_in_at
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
LEFT JOIN auth.users au ON p.id = au.id
WHERE c.name ILIKE '%chatkara%' OR c.name = 'CHATKARA'
  AND p.user_type = 'cafe_owner';

-- 3. Check rewards system functions
SELECT 
    '=== REWARDS SYSTEM FUNCTIONS ===' as section,
    routine_name,
    routine_type,
    CASE 
        WHEN routine_name IN ('handle_new_rewards_order_completion', 'calculate_points_earned', 'get_tier_discount', 'calculate_cafe_tier') 
        THEN '✅ CRITICAL FOR REWARDS'
        ELSE 'ℹ️ OTHER'
    END as importance
FROM information_schema.routines 
WHERE routine_name LIKE '%rewards%' 
   OR routine_name LIKE '%points%'
   OR routine_name LIKE '%tier%'
   OR routine_name LIKE '%loyalty%'
ORDER BY importance DESC, routine_name;

-- 4. Check active triggers on orders table
SELECT 
    '=== ACTIVE ORDER TRIGGERS ===' as section,
    trigger_name,
    event_manipulation,
    action_timing,
    CASE 
        WHEN trigger_name = 'new_rewards_order_completion_trigger' THEN '✅ REWARDS TRIGGER'
        WHEN trigger_name LIKE '%loyalty%' THEN '⚠️ LOYALTY TRIGGER'
        ELSE 'ℹ️ OTHER'
    END as type
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
ORDER BY type DESC, trigger_name;

-- 5. Test rewards calculation for different order amounts
SELECT 
    '=== REWARDS CALCULATION TEST ===' as section,
    'Testing points calculation for different order amounts' as note;

-- Test 5% points calculation
SELECT 
    'Order Amount' as test_type,
    89.00 as amount,
    calculate_points_earned(89.00) as points_earned,
    'Should be 4 points (5% of ₹89)' as expected;

SELECT 
    'Order Amount' as test_type,
    150.00 as amount,
    calculate_points_earned(150.00) as points_earned,
    'Should be 7 points (5% of ₹150)' as expected;

SELECT 
    'Order Amount' as test_type,
    250.00 as amount,
    calculate_points_earned(250.00) as points_earned,
    'Should be 12 points (5% of ₹250)' as expected;

-- 6. Test tier discounts
SELECT 
    '=== TIER DISCOUNT TEST ===' as section,
    'Testing tier-based discounts' as note;

SELECT 
    'Tier' as test_type,
    'foodie' as tier,
    get_tier_discount('foodie') as discount_percentage,
    'Should be 0%' as expected;

SELECT 
    'Tier' as test_type,
    'gourmet' as tier,
    get_tier_discount('gourmet') as discount_percentage,
    'Should be 7%' as expected;

SELECT 
    'Tier' as test_type,
    'connoisseur' as tier,
    get_tier_discount('connoisseur') as discount_percentage,
    'Should be 10%' as expected;