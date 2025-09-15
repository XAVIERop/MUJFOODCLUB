-- =====================================================
-- Analyze Remaining Trigger Conflicts
-- =====================================================

-- 1. Check what order_operations_final_trigger does
SELECT 
  '=== ORDER OPERATIONS FINAL FUNCTION ===' as section,
  routine_name,
  routine_type,
  'This runs BEFORE our trigger - might be safe' as note
FROM information_schema.routines 
WHERE routine_name = 'handle_order_operations_final';

-- 2. Check what track_maintenance_spending_trigger does
SELECT 
  '=== TRACK MAINTENANCE SPENDING FUNCTION ===' as section,
  routine_name,
  routine_type,
  'This runs AFTER our trigger - might conflict' as note
FROM information_schema.routines 
WHERE routine_name = 'track_maintenance_spending';

-- 3. Check what the other functions do
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

-- 4. Summary of trigger execution order
SELECT 
  '=== TRIGGER EXECUTION ORDER ===' as section,
  'BEFORE UPDATE: order_operations_final_trigger, update_orders_updated_at' as before_triggers,
  'AFTER UPDATE: new_rewards_order_completion_trigger, processing_time_trigger, status_update_notification_final_trigger, track_maintenance_spending_trigger' as after_triggers;
