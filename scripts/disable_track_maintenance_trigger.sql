-- =====================================================
-- Disable track_maintenance_spending_trigger
-- =====================================================

-- Disable the conflicting trigger
DROP TRIGGER IF EXISTS track_maintenance_spending_trigger ON public.orders;

-- Verify our new trigger is still active
SELECT 
  '=== NEW REWARDS TRIGGER STATUS ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
  AND trigger_name = 'new_rewards_order_completion_trigger';

-- Check all remaining UPDATE triggers
SELECT 
  '=== ALL REMAINING UPDATE TRIGGERS ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
  AND event_manipulation = 'UPDATE'
ORDER BY trigger_name;

-- Final verification - check if any triggers still modify loyalty data
SELECT 
  '=== FINAL CONFLICT CHECK ===' as section,
  trigger_name,
  action_statement,
  CASE 
    WHEN action_statement LIKE '%loyalty%' THEN 'POTENTIAL CONFLICT'
    WHEN action_statement LIKE '%points%' THEN 'POTENTIAL CONFLICT'
    WHEN action_statement LIKE '%spent%' THEN 'POTENTIAL CONFLICT'
    ELSE 'SAFE'
  END as conflict_assessment
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
  AND event_manipulation = 'UPDATE'
ORDER BY trigger_name;
