-- =====================================================
-- Check What's Currently Handling Rewards
-- =====================================================

-- 1. Check what order_completion_simple_trigger does
SELECT 
  '=== ORDER COMPLETION SIMPLE TRIGGER ===' as section,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'handle_order_completion_simple';

-- 2. Check if there are any loyalty-related functions
SELECT 
  '=== LOYALTY FUNCTIONS ===' as section,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name LIKE '%loyalty%' 
   OR routine_name LIKE '%points%'
ORDER BY routine_name;

-- 3. Check what the order_operations_final_trigger does
SELECT 
  '=== ORDER OPERATIONS FINAL TRIGGER ===' as section,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'handle_order_operations_final';

-- 4. Check if our new rewards function exists
SELECT 
  '=== NEW REWARDS FUNCTION STATUS ===' as section,
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_rewards_order_completion';
