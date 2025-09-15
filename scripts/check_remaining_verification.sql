-- =====================================================
-- Check Remaining Verification Results
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

-- 3. Test the fixed point calculation function
SELECT 
  '=== POINT CALCULATION TEST ===' as section,
  calculate_points_earned(100.00) as test_100_rupees,
  calculate_points_earned(475.00) as test_475_rupees,
  calculate_points_earned(850.00) as test_850_rupees,
  'Should be 5, 23, 42 respectively' as expected;

-- 4. Check if any duplicate transactions remain
SELECT 
  '=== DUPLICATE CHECK ===' as section,
  order_id,
  COUNT(*) as transaction_count,
  CASE 
    WHEN COUNT(*) > 1 THEN 'DUPLICATE FOUND'
    ELSE 'NO DUPLICATES'
  END as status
FROM public.cafe_loyalty_transactions 
WHERE user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d'
GROUP BY order_id
ORDER BY transaction_count DESC;
