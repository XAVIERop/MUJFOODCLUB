-- =====================================================
-- Check Active Triggers and Recent Transactions
-- =====================================================

-- 1. Check which triggers are actually active on orders table
SELECT 
  '=== ACTIVE TRIGGERS ON ORDERS ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
  AND event_manipulation = 'UPDATE'
ORDER BY trigger_name;

-- 2. Check recent transactions for the ₹638 order
SELECT 
  '=== RECENT TRANSACTIONS ===' as section,
  id,
  user_id,
  order_id,
  points_change,
  transaction_type,
  description,
  created_at
FROM public.cafe_loyalty_transactions 
WHERE user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d'
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check if our calculate_points_earned function is correct
SELECT 
  '=== FUNCTION DEFINITION CHECK ===' as section,
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'calculate_points_earned';
