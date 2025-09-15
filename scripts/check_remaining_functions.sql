-- =====================================================
-- Check Remaining Functions
-- =====================================================

-- Check calculate_enhanced_points function
SELECT 
  '=== CALCULATE ENHANCED POINTS ===' as section,
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'calculate_enhanced_points';

-- Check check_maintenance_expiry function
SELECT 
  '=== CHECK MAINTENANCE EXPIRY ===' as section,
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'check_maintenance_expiry';

-- Check handle_new_rewards_order_completion function
SELECT 
  '=== HANDLE NEW REWARDS ORDER COMPLETION ===' as section,
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_rewards_order_completion';
