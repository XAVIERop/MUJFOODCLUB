-- =====================================================
-- Check Main Function and Interfering Functions
-- =====================================================

-- 1. Check our main function definition
SELECT 
  '=== MAIN FUNCTION DEFINITION ===' as section,
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_rewards_order_completion';

-- 2. Check the most suspicious interfering functions
SELECT 
  '=== SUSPICIOUS FUNCTION 1: handle_cafe_loyalty_order_completion ===' as section,
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_cafe_loyalty_order_completion';

-- 3. Check another suspicious function
SELECT 
  '=== SUSPICIOUS FUNCTION 2: handle_order_completion_simple ===' as section,
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_order_completion_simple';

-- 4. Check if there are any triggers still calling these functions
SELECT 
  '=== TRIGGERS CALLING INTERFERING FUNCTIONS ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
  AND (action_statement LIKE '%handle_cafe_loyalty_order_completion%'
       OR action_statement LIKE '%handle_order_completion_simple%'
       OR action_statement LIKE '%handle_order_operations_final%');
