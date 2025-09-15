-- =====================================================
-- Check All Functions with current_tier References
-- =====================================================

-- Get the full function definition for handle_new_rewards_order_completion
SELECT 
  '=== HANDLE NEW REWARDS ORDER COMPLETION ===' as section,
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_rewards_order_completion';

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

-- Check track_maintenance_spending function
SELECT 
  '=== TRACK MAINTENANCE SPENDING ===' as section,
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'track_maintenance_spending';
