-- =====================================================
-- Final Status Check
-- =====================================================

-- 1. Check Maahi's corrected points
SELECT 
  '=== MAHI CORRECTED POINTS ===' as section,
  clp.points as cafe_points,
  clp.total_spent as cafe_spent,
  clp.current_tier,
  clp.monthly_spend_30_days,
  c.name as cafe_name
FROM public.cafe_loyalty_points clp
JOIN public.cafes c ON clp.cafe_id = c.id
WHERE clp.user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d';

-- 2. Check Maahi's corrected transactions
SELECT 
  '=== MAHI CORRECTED TRANSACTIONS ===' as section,
  id,
  order_id,
  points_change,
  transaction_type,
  description,
  created_at
FROM public.cafe_loyalty_transactions 
WHERE user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d'
ORDER BY created_at DESC;
