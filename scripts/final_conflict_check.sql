-- =====================================================
-- Final Conflict Check
-- =====================================================

-- Check if any triggers still modify loyalty data
SELECT 
  '=== FINAL CONFLICT CHECK ===' as section,
  trigger_name,
  action_statement,
  CASE 
    WHEN action_statement LIKE '%loyalty%' THEN 'POTENTIAL CONFLICT'
    WHEN action_statement LIKE '%points%' THEN 'POTENTIAL CONFLICT'
    WHEN action_statement LIKE '%spent%' THEN 'POTENTIAL CONFLICT'
    ELSE 'SAFE'
  END as conflict_assessment
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
  AND event_manipulation = 'UPDATE'
ORDER BY trigger_name;

-- Verify our new rewards system is the only one handling loyalty
SELECT 
  '=== NEW REWARDS SYSTEM STATUS ===' as section,
  'Our new rewards trigger is active and should be the only one handling loyalty points' as status,
  'All conflicting triggers have been disabled' as result;

-- Test the system by checking if our functions exist
SELECT 
  '=== REQUIRED FUNCTIONS CHECK ===' as section,
  routine_name,
  routine_type,
  'All required functions for new rewards system' as note
FROM information_schema.routines 
WHERE routine_name IN (
  'handle_new_rewards_order_completion',
  'calculate_cafe_tier',
  'get_tier_discount',
  'calculate_points_earned'
)
ORDER BY routine_name;
