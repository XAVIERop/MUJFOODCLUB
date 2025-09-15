-- =====================================================
-- Debug New Order Flow
-- =====================================================

-- 1. Check if our handle_new_rewards_order_completion function is actually correct
SELECT 
  '=== FUNCTION DEFINITION CHECK ===' as section,
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_rewards_order_completion';

-- 2. Check if there are any other functions that might be interfering
SELECT 
  '=== ALL FUNCTIONS WITH POINTS CALCULATION ===' as section,
  routine_name,
  routine_type,
  CASE 
    WHEN routine_definition LIKE '%points%' AND routine_definition LIKE '%NEW.total_amount%' THEN 'MIGHT BE INTERFERING'
    WHEN routine_definition LIKE '%loyalty_points%' THEN 'MIGHT BE INTERFERING'
    ELSE 'PROBABLY SAFE'
  END as interference_risk
FROM information_schema.routines 
WHERE routine_definition LIKE '%points%'
  AND routine_name != 'calculate_points_earned'
ORDER BY interference_risk DESC, routine_name;

-- 3. Check if there are any RLS policies that might be interfering
SELECT 
  '=== RLS POLICIES ON CAFE_LOYALTY_POINTS ===' as section,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'cafe_loyalty_points';

-- 4. Test our calculate_points_earned function directly
SELECT 
  '=== FUNCTION TEST ===' as section,
  calculate_points_earned(100.00) as test_100,
  calculate_points_earned(213.00) as test_213,
  calculate_points_earned(425.00) as test_425,
  calculate_points_earned(638.00) as test_638,
  'Should be 5, 10, 21, 31 respectively' as expected;
