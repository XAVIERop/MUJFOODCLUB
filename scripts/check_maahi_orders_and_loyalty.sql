-- Check Maahi's orders and cafe loyalty status
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Check Maahi's orders
SELECT 
  '=== MAHI ORDERS ===' as section,
  o.id,
  o.cafe_id,
  c.name as cafe_name,
  o.total_amount,
  o.points_earned,
  o.status,
  o.created_at
FROM public.orders o
LEFT JOIN public.cafes c ON o.cafe_id = c.id
LEFT JOIN public.profiles p ON o.user_id = p.id
WHERE p.email = 'maahi.229301245@muj.manipal.edu'
ORDER BY o.created_at DESC;

-- 2. Check if Maahi has cafe_loyalty_points record
SELECT 
  '=== MAHI CAFE LOYALTY POINTS ===' as section,
  clp.id,
  clp.user_id,
  clp.cafe_id,
  c.name as cafe_name,
  clp.points,
  clp.total_spent,
  clp.loyalty_level,
  clp.created_at,
  clp.updated_at
FROM public.cafe_loyalty_points clp
LEFT JOIN public.cafes c ON clp.cafe_id = c.id
LEFT JOIN public.profiles p ON clp.user_id = p.id
WHERE p.email = 'maahi.229301245@muj.manipal.edu';
