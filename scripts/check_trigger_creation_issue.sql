-- =====================================================
-- Check Why Our Trigger Wasn't Created
-- =====================================================

-- 1. Check if our function was created
SELECT 
  '=== NEW REWARDS FUNCTION STATUS ===' as section,
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_rewards_order_completion';

-- 2. Check all functions that contain 'rewards' in the name
SELECT 
  '=== ALL REWARDS FUNCTIONS ===' as section,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name LIKE '%reward%'
ORDER BY routine_name;

-- 3. Check all triggers on orders table
SELECT 
  '=== ALL TRIGGERS ON ORDERS ===' as section,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
ORDER BY trigger_name;

-- 4. Try to create the trigger again with a simpler approach
-- First, let's see if we can create a simple test function
SELECT 
  '=== TESTING FUNCTION CREATION ===' as section,
  'Attempting to create simple test function' as action;
