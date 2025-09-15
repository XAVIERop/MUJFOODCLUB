-- =====================================================
-- Check Rewards-Related Triggers Specifically
-- =====================================================

-- 1. Check if our new rewards trigger exists
SELECT 
  '=== NEW REWARDS TRIGGER STATUS ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
  AND trigger_name LIKE '%reward%'
ORDER BY trigger_name;

-- 2. Check all triggers that might handle order completion
SELECT 
  '=== ORDER COMPLETION TRIGGERS ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
  AND (trigger_name LIKE '%completion%' 
       OR trigger_name LIKE '%status%'
       OR trigger_name LIKE '%loyalty%')
ORDER BY trigger_name;

-- 3. Check if our new function exists
SELECT 
  '=== NEW REWARDS FUNCTION STATUS ===' as section,
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_rewards_order_completion';

-- 4. Check what the order_completion_simple_trigger does
SELECT 
  '=== ORDER COMPLETION SIMPLE TRIGGER ===' as section,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'handle_order_completion_simple';

-- 5. Check if there are any loyalty-related functions
SELECT 
  '=== LOYALTY FUNCTIONS ===' as section,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name LIKE '%loyalty%' 
   OR routine_name LIKE '%points%'
ORDER BY routine_name;
