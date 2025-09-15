-- =====================================================
-- Check What Old Functions Are Doing
-- =====================================================

-- 1. Check what order_completion_simple_trigger does
SELECT 
  '=== ORDER COMPLETION SIMPLE FUNCTION ===' as section,
  routine_name,
  routine_type,
  'This is the OLD system that conflicts with our new one' as note
FROM information_schema.routines 
WHERE routine_name = 'handle_order_completion_simple';

-- 2. Check what order_operations_final_trigger does
SELECT 
  '=== ORDER OPERATIONS FINAL FUNCTION ===' as section,
  routine_name,
  routine_type,
  'This might also be handling rewards' as note
FROM information_schema.routines 
WHERE routine_name = 'handle_order_operations_final';

-- 3. Check what track_maintenance_spending_trigger does
SELECT 
  '=== TRACK MAINTENANCE SPENDING FUNCTION ===' as section,
  routine_name,
  routine_type,
  'This might be interfering with our system' as note
FROM information_schema.routines 
WHERE routine_name = 'track_maintenance_spending';

-- 4. Check if there are any functions that update profiles table
SELECT 
  '=== FUNCTIONS THAT MIGHT UPDATE PROFILES ===' as section,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name LIKE '%profile%'
   OR routine_name LIKE '%loyalty%'
   OR routine_name LIKE '%points%'
ORDER BY routine_name;
