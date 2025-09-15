-- =====================================================
-- Check Function Definition for Ambiguous Column
-- =====================================================

-- Get the full function definition to find the ambiguous column reference
SELECT 
  '=== FUNCTION DEFINITION ===' as section,
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_rewards_order_completion';

-- Check if there are any other functions that might have the same issue
SELECT 
  '=== ALL FUNCTIONS WITH CURRENT_TIER ===' as section,
  routine_name,
  routine_type,
  'Might contain ambiguous column reference' as note
FROM information_schema.routines 
WHERE routine_definition LIKE '%current_tier%'
ORDER BY routine_name;
