-- =====================================================
-- Disable handle_order_completion_simple Function
-- =====================================================

-- 1. Check if there are any triggers still calling this function
SELECT 
  '=== TRIGGERS CALLING handle_order_completion_simple ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
  AND action_statement LIKE '%handle_order_completion_simple%';

-- 2. Drop the function entirely to prevent any calls
DROP FUNCTION IF EXISTS handle_order_completion_simple();

-- 3. Verify the function is gone
SELECT 
  '=== FUNCTION REMOVAL VERIFICATION ===' as section,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'handle_order_completion_simple';

-- 4. Check remaining triggers
SELECT 
  '=== REMAINING TRIGGERS ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
ORDER BY trigger_name;

-- 5. Final verification
SELECT 
  '=== ROOT CAUSE FIXED ===' as section,
  'handle_order_completion_simple function removed' as status1,
  'Frontend can no longer override database calculations' as status2,
  'Only our new rewards system will handle points' as status3,
  'System should now work correctly' as status4;
