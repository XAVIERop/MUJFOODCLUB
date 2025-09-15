-- =====================================================
-- Verify New Rewards System is Active
-- =====================================================

-- 1. Check if our new rewards trigger is now active
SELECT 
  '=== NEW REWARDS TRIGGER STATUS ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
  AND trigger_name = 'new_rewards_order_completion_trigger';

-- 2. Check all active triggers on orders table
SELECT 
  '=== ALL ACTIVE TRIGGERS ON ORDERS ===' as section,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
ORDER BY trigger_name;

-- 3. Verify our new rewards function exists
SELECT 
  '=== NEW REWARDS FUNCTION STATUS ===' as section,
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_rewards_order_completion';

-- 4. Check Maahi's current status with new system
SELECT 
  '=== MAHI STATUS WITH NEW SYSTEM ===' as section,
  p.email,
  clp.points,
  clp.total_spent,
  clp.current_tier,
  clp.monthly_spend_30_days,
  get_tier_discount(clp.current_tier) as discount_percentage
FROM public.profiles p
LEFT JOIN public.cafe_loyalty_points clp ON p.id = clp.user_id
WHERE p.email = 'maahi.229301245@muj.manipal.edu';
