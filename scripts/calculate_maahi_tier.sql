-- =====================================================
-- Calculate Maahi's Correct Tier
-- =====================================================

-- 1. Calculate Maahi's 30-day spending
SELECT 
  '=== MAHI 30-DAY SPENDING ===' as section,
  SUM(o.total_amount) as total_spent_last_30_days,
  COUNT(*) as orders_count
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.id
WHERE p.email = 'maahi.229301245@muj.manipal.edu'
  AND o.status = 'completed'
  AND o.created_at >= NOW() - INTERVAL '30 days';

-- 2. Calculate her correct tier
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

-- 3. Check all her orders (not just last 30 days)
SELECT 
  '=== MAHI ALL ORDERS ===' as section,
  o.id,
  o.total_amount,
  o.status,
  o.created_at,
  EXTRACT(DAY FROM NOW() - o.created_at)::INTEGER as days_ago
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.id
WHERE p.email = 'maahi.229301245@muj.manipal.edu'
ORDER BY o.created_at DESC;
