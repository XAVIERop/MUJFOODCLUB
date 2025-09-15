-- =====================================================
-- Test New Rewards System with Maahi
-- =====================================================

-- 1. Check Maahi's current data
SELECT 
  '=== MAHI CURRENT DATA ===' as section,
  p.email,
  p.loyalty_points as profile_points,
  p.total_spent as profile_spent,
  clp.points as cafe_points,
  clp.total_spent as cafe_spent,
  clp.current_tier,
  clp.monthly_spend_30_days
FROM public.profiles p
LEFT JOIN public.cafe_loyalty_points clp ON p.id = clp.user_id
WHERE p.email = 'maahi.229301245@muj.manipal.edu';

-- 2. Calculate Maahi's correct tier based on her spending
SELECT 
  '=== MAHI TIER CALCULATION ===' as section,
  SUM(o.total_amount) as total_spent_last_30_days,
  calculate_cafe_tier(SUM(o.total_amount)) as calculated_tier,
  get_tier_discount(calculate_cafe_tier(SUM(o.total_amount))) as discount_percentage
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.id
WHERE p.email = 'maahi.229301245@muj.manipal.edu'
  AND o.status = 'completed'
  AND o.created_at >= NOW() - INTERVAL '30 days';

-- 3. Check Maahi's orders for testing
SELECT 
  '=== MAHI ORDERS ===' as section,
  o.id,
  o.total_amount,
  o.status,
  o.created_at,
  'Days ago: ' || EXTRACT(DAY FROM NOW() - o.created_at)::INTEGER as days_ago
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.id
WHERE p.email = 'maahi.229301245@muj.manipal.edu'
ORDER BY o.created_at DESC;

-- 4. Update Maahi's cafe loyalty data with new system
UPDATE public.cafe_loyalty_points 
SET 
  current_tier = 'foodie', -- Based on her spending pattern
  monthly_spend_30_days = (
    SELECT COALESCE(SUM(total_amount), 0)
    FROM public.orders o
    WHERE o.user_id = cafe_loyalty_points.user_id 
      AND o.cafe_id = cafe_loyalty_points.cafe_id
      AND o.status = 'completed'
      AND o.created_at >= NOW() - INTERVAL '30 days'
  ),
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM public.profiles WHERE email = 'maahi.229301245@muj.manipal.edu'
);

-- 5. Verify the update
SELECT 
  '=== VERIFICATION - MAHI UPDATED ===' as section,
  clp.points,
  clp.total_spent,
  clp.current_tier,
  clp.monthly_spend_30_days,
  get_tier_discount(clp.current_tier) as discount_percentage
FROM public.cafe_loyalty_points clp
LEFT JOIN public.profiles p ON clp.user_id = p.id
WHERE p.email = 'maahi.229301245@muj.manipal.edu';
