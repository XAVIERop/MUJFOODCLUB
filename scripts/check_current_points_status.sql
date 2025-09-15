-- =====================================================
-- Check Current Points Status
-- =====================================================

-- 1. Check Maahi's current points
SELECT 
  '=== MAHI CURRENT POINTS ===' as section,
  clp.points as cafe_points,
  clp.total_spent as cafe_spent,
  clp.current_tier,
  c.name as cafe_name,
  clp.updated_at
FROM public.cafe_loyalty_points clp
JOIN public.cafes c ON clp.cafe_id = c.id
WHERE clp.user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d';

-- 2. Check all recent transactions
SELECT 
  '=== ALL RECENT TRANSACTIONS ===' as section,
  id,
  order_id,
  points_change,
  transaction_type,
  description,
  created_at
FROM public.cafe_loyalty_transactions 
WHERE user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d'
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check if there are any other active triggers we missed
SELECT 
  '=== ALL ACTIVE TRIGGERS ON ORDERS ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
ORDER BY trigger_name;

-- 4. Check if our function is still correct
SELECT 
  '=== FUNCTION VERIFICATION ===' as section,
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'calculate_points_earned';
