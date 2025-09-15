-- Verify Maahi's cafe loyalty points fix
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Check Maahi's updated cafe loyalty points
SELECT 
  '=== MAHI CAFE LOYALTY POINTS (UPDATED) ===' as section,
  clp.id,
  clp.user_id,
  clp.cafe_id,
  c.name as cafe_name,
  clp.points,
  clp.total_spent,
  clp.loyalty_level,
  clp.first_order_bonus_awarded,
  clp.updated_at
FROM public.cafe_loyalty_points clp
LEFT JOIN public.cafes c ON clp.cafe_id = c.id
LEFT JOIN public.profiles p ON clp.user_id = p.id
WHERE p.email = 'maahi.229301245@muj.manipal.edu';

-- 2. Check Maahi's profile data (should be correct)
SELECT 
  '=== MAHI PROFILE (SHOULD BE CORRECT) ===' as section,
  p.id,
  p.email,
  p.full_name,
  p.loyalty_points,
  p.loyalty_tier,
  p.total_orders,
  p.total_spent,
  p.updated_at
FROM public.profiles p
WHERE p.email = 'maahi.229301245@muj.manipal.edu';
