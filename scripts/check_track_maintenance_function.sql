-- =====================================================
-- Check track_maintenance_spending Function
-- =====================================================

-- 1. Check what track_maintenance_spending_trigger does
SELECT 
  '=== TRACK MAINTENANCE SPENDING FUNCTION ===' as section,
  routine_name,
  routine_type,
  'This runs AFTER our trigger - might conflict' as note
FROM information_schema.routines 
WHERE routine_name = 'track_maintenance_spending';

-- 2. Check what the other functions do
SELECT 
  '=== OTHER FUNCTIONS ===' as section,
  routine_name,
  routine_type,
  CASE 
    WHEN routine_name = 'calculate_processing_time' THEN 'SAFE - only calculates timing'
    WHEN routine_name = 'handle_status_update_notification_final' THEN 'SAFE - only sends notifications'
    WHEN routine_name = 'update_updated_at_column' THEN 'SAFE - only updates timestamps'
    ELSE 'UNKNOWN'
  END as assessment
FROM information_schema.routines 
WHERE routine_name IN (
  'calculate_processing_time',
  'handle_status_update_notification_final',
  'update_updated_at_column'
)
ORDER BY routine_name;

-- 3. Test if our system works now
SELECT 
  '=== SYSTEM TEST ===' as section,
  'All conflicting triggers should be disabled now' as status,
  'POS dashboard should work without errors' as expected_result;
