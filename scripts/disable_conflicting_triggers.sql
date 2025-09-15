-- =====================================================
-- Disable Conflicting Triggers - Keep Only New System
-- =====================================================

-- 1. Disable the old conflicting trigger
DROP TRIGGER IF EXISTS order_completion_simple_trigger ON public.orders;

-- 2. Check if track_maintenance_spending_trigger conflicts
-- (We'll keep this one as it might be needed for other purposes)
-- DROP TRIGGER IF EXISTS track_maintenance_spending_trigger ON public.orders;

-- 3. Verify our new trigger is still active
SELECT 
  '=== NEW REWARDS TRIGGER STATUS ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
  AND trigger_name = 'new_rewards_order_completion_trigger';

-- 4. Check remaining triggers on UPDATE events
SELECT 
  '=== REMAINING UPDATE TRIGGERS ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
  AND event_manipulation = 'UPDATE'
ORDER BY trigger_name;

-- 5. Count total triggers now
SELECT 
  '=== TOTAL TRIGGERS AFTER CLEANUP ===' as section,
  COUNT(*) as total_triggers
FROM information_schema.triggers 
WHERE event_object_table = 'orders';
