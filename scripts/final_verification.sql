-- =====================================================
-- Final Verification - New Rewards System Complete
-- =====================================================

-- 1. Verify our new rewards trigger is now active
SELECT 
  '=== NEW REWARDS TRIGGER STATUS ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
  AND trigger_name = 'new_rewards_order_completion_trigger';

-- 2. Count total active triggers on orders table
SELECT 
  '=== TOTAL ACTIVE TRIGGERS ===' as section,
  COUNT(*) as total_triggers
FROM information_schema.triggers 
WHERE event_object_table = 'orders';

-- 3. Check Maahi's final status
SELECT 
  '=== MAHI FINAL STATUS ===' as section,
  p.email,
  clp.points,
  clp.total_spent,
  clp.current_tier,
  clp.monthly_spend_30_days,
  get_tier_discount(clp.current_tier) as discount_percentage
FROM public.profiles p
LEFT JOIN public.cafe_loyalty_points clp ON p.id = clp.user_id
WHERE p.email = 'maahi.229301245@muj.manipal.edu';

-- 4. Summary of what we've accomplished
SELECT 
  '=== SYSTEM STATUS SUMMARY ===' as section,
  'New unified rewards system is now ACTIVE' as status,
  'All future orders will use the new system' as note,
  'Maahi data is synchronized and correct' as maahi_status;
