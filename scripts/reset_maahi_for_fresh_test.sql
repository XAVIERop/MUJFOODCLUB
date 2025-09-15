-- =====================================================
-- Reset Maahi for Fresh Testing
-- =====================================================

-- 1. Check Maahi's current status before reset
SELECT 
  '=== MAHI CURRENT STATUS (BEFORE RESET) ===' as section,
  clp.points as cafe_points,
  clp.total_spent as cafe_spent,
  clp.current_tier,
  c.name as cafe_name
FROM public.cafe_loyalty_points clp
JOIN public.cafes c ON clp.cafe_id = c.id
WHERE clp.user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d';

-- 2. Delete all of Maahi's orders (this will test the system from scratch)
DELETE FROM public.orders 
WHERE user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d';

-- 3. Delete all of Maahi's cafe loyalty points records
DELETE FROM public.cafe_loyalty_points 
WHERE user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d';

-- 4. Delete all of Maahi's cafe loyalty transactions
DELETE FROM public.cafe_loyalty_transactions 
WHERE user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d';

-- 5. Reset Maahi's profile points to 0
UPDATE public.profiles 
SET 
    loyalty_points = 0,
    total_orders = 0,
    total_spent = 0.00,
    loyalty_tier = 'foodie',
    updated_at = NOW()
WHERE id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d';

-- 6. Verify complete reset
SELECT 
  '=== MAHI RESET VERIFICATION ===' as section,
  p.loyalty_points as profile_points,
  p.total_orders as profile_orders,
  p.total_spent as profile_spent,
  p.loyalty_tier as profile_tier
FROM public.profiles p
WHERE p.id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d';

-- 7. Check that no cafe loyalty data exists
SELECT 
  '=== CAFE LOYALTY DATA CHECK ===' as section,
  COUNT(*) as cafe_loyalty_points_count,
  'Should be 0' as expected
FROM public.cafe_loyalty_points 
WHERE user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d';

-- 8. Check that no transactions exist
SELECT 
  '=== TRANSACTIONS CHECK ===' as section,
  COUNT(*) as transaction_count,
  'Should be 0' as expected
FROM public.cafe_loyalty_transactions 
WHERE user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d';

-- 9. Check that no orders exist
SELECT 
  '=== ORDERS CHECK ===' as section,
  COUNT(*) as order_count,
  'Should be 0' as expected
FROM public.orders 
WHERE user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d';

-- 10. Fresh test ready message
SELECT 
  '=== FRESH TEST READY ===' as section,
  'Maahi data completely reset' as status1,
  'All orders, points, and transactions deleted' as status2,
  'Ready for fresh testing of fixed system' as status3,
  'Next: Place a new order to test 5% calculation' as status4;
