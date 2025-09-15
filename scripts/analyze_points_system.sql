-- =====================================================
-- Analyze Current Points System
-- =====================================================

-- 1. Check Maahi's current points in both systems
SELECT 
  '=== MAHI PROFILE POINTS ===' as section,
  id,
  email,
  loyalty_points as profile_points,
  total_spent as profile_spent,
  loyalty_tier as profile_tier
FROM public.profiles 
WHERE email = 'maahi.229301245@muj.manipal.edu';

-- 2. Check Maahi's cafe-specific points
SELECT 
  '=== MAHI CAFE LOYALTY POINTS ===' as section,
  clp.id,
  clp.user_id,
  c.name as cafe_name,
  clp.points as cafe_points,
  clp.total_spent as cafe_spent,
  clp.loyalty_level,
  clp.first_order_bonus_awarded,
  clp.monthly_spend_30_days,
  clp.current_tier,
  clp.updated_at
FROM public.cafe_loyalty_points clp
JOIN public.cafes c ON clp.cafe_id = c.id
WHERE clp.user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d';

-- 3. Check Maahi's orders to verify points calculation
SELECT 
  '=== MAHI ORDERS ===' as section,
  id,
  cafe_id,
  total_amount,
  status,
  created_at,
  CASE 
    WHEN status = 'completed' THEN 'Should have earned points'
    ELSE 'No points earned'
  END as points_status
FROM public.orders 
WHERE user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d'
ORDER BY created_at DESC;

-- 4. Check cafe loyalty transactions
SELECT 
  '=== CAFE LOYALTY TRANSACTIONS ===' as section,
  id,
  user_id,
  cafe_id,
  order_id,
  points_change,
  transaction_type,
  description,
  created_at
FROM public.cafe_loyalty_transactions 
WHERE user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d'
ORDER BY created_at DESC;
