-- =====================================================
-- Disable order_operations_final_trigger
-- =====================================================

-- Disable the conflicting trigger that uses old loyalty system
DROP TRIGGER IF EXISTS order_operations_final_trigger ON public.orders;

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

-- Check remaining active triggers
SELECT 
  '=== REMAINING ACTIVE TRIGGERS ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
  AND event_manipulation = 'UPDATE'
ORDER BY trigger_name;

-- Fix Maahi's points again (reset from 763 back to 125)
UPDATE public.cafe_loyalty_points 
SET 
    points = 125,  -- Reset to correct value
    updated_at = NOW()
WHERE user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d';

-- Delete the incorrect ₹638 transaction
DELETE FROM public.cafe_loyalty_transactions 
WHERE user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d'
  AND order_id = '078dbaaa-5bf2-4f92-ab02-ed0b9adfc260'
  AND points_change = 638;

-- Final verification
SELECT 
  '=== TRIGGER DISABLED ===' as section,
  'order_operations_final_trigger has been disabled' as status,
  'Only new_rewards_order_completion_trigger should remain' as expected;
