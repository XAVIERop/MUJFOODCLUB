-- =====================================================
-- Check Other Debug Results
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
