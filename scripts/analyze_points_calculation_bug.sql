-- Analyze Points Calculation Bug
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Check the enhanced points calculation function
SELECT 
  '=== ENHANCED POINTS FUNCTION ===' as section,
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE proname = 'calculate_enhanced_points';

-- 2. Test the enhanced points function with Maahi's order amount
SELECT 
  '=== TEST POINTS CALCULATION ===' as section,
  'Order Amount: ₹950' as input,
  'Expected Base Points (5%): 47' as base_points,
  'First Order Bonus: 50' as bonus,
  'Expected Total: 97' as expected_total,
  'Actual Points: 1000' as actual_points,
  'DIFFERENCE: 903 POINTS TOO MANY!' as issue;

-- 3. Check if there are multiple point calculation systems running
SELECT 
  '=== POINT CALCULATION FUNCTIONS ===' as section,
  proname as function_name,
  prokind as function_type
FROM pg_proc 
WHERE proname LIKE '%point%' OR proname LIKE '%loyalty%' OR proname LIKE '%reward%'
ORDER BY proname;

-- 4. Check triggers that might be awarding points
SELECT 
  '=== POINTS TRIGGERS ===' as section,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%point%' OR trigger_name LIKE '%loyalty%' OR trigger_name LIKE '%reward%'
ORDER BY trigger_name;

-- 5. Check for duplicate point awarding
SELECT 
  '=== POTENTIAL DUPLICATE POINT AWARDING ===' as section,
  'Multiple triggers might be awarding points' as issue_1,
  'Enhanced function might be called multiple times' as issue_2,
  'Frontend and backend both calculating points' as issue_3,
  'First order bonus awarded multiple times' as issue_4;

-- 6. Check Maahi's specific case
SELECT 
  '=== MAHI SPECIFIC ANALYSIS ===' as section,
  p.email,
  p.full_name,
  p.loyalty_points,
  p.total_orders,
  p.total_spent,
  o.total_amount as order_amount,
  o.points_earned as order_points,
  'Points per ₹: ' || ROUND(p.loyalty_points::DECIMAL / p.total_spent, 2) as points_per_rupee,
  'Expected points per ₹: 0.10' as expected_rate
FROM public.profiles p
LEFT JOIN public.orders o ON p.id = o.user_id
WHERE p.email LIKE '%maahi%' OR p.full_name LIKE '%maahi%'
ORDER BY o.created_at DESC
LIMIT 1;
