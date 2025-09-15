-- =====================================================
-- Check Triggers and Transactions Debug
-- =====================================================

-- 1. Check ALL triggers on orders table
SELECT 
  '=== ALL TRIGGERS ON ORDERS TABLE ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
ORDER BY trigger_name;

-- 2. Check all recent transactions for Maahi
SELECT 
  '=== ALL MAHI TRANSACTIONS ===' as section,
  id,
  order_id,
  points_change,
  transaction_type,
  description,
  created_at
FROM public.cafe_loyalty_transactions 
WHERE user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d'
ORDER BY created_at DESC
LIMIT 15;
