-- =====================================================
-- Emergency Debug - Check ALL Triggers
-- =====================================================

-- 1. Check ALL triggers on orders table (including INSERT)
SELECT 
  '=== ALL TRIGGERS ON ORDERS TABLE ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
ORDER BY trigger_name;

-- 2. Check if there are any INSERT triggers that might be causing duplicates
SELECT 
  '=== INSERT TRIGGERS ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
  AND event_manipulation = 'INSERT'
ORDER BY trigger_name;

-- 3. Check all recent transactions for Maahi
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
ORDER BY created_at DESC;

-- 4. Check Maahi's current points
SELECT 
  '=== MAHI CURRENT STATUS ===' as section,
  clp.points as cafe_points,
  clp.total_spent as cafe_spent,
  clp.current_tier,
  c.name as cafe_name
FROM public.cafe_loyalty_points clp
JOIN public.cafes c ON clp.cafe_id = c.id
WHERE clp.user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d';
