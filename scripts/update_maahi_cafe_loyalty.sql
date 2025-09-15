-- Update Maahi's existing cafe loyalty points record
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Update Maahi's existing cafe_loyalty_points record
UPDATE public.cafe_loyalty_points 
SET 
  points = 75,
  total_spent = 475.00,
  loyalty_level = 1, -- 1 = foodie
  first_order_bonus_awarded = TRUE,
  updated_at = NOW()
WHERE user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d' 
  AND cafe_id = '25d0b247-0731-4e52-a0fb-023526adfa34';

-- 2. Verify the update
SELECT 
  '=== VERIFICATION - MAHI CAFE LOYALTY POINTS ===' as section,
  clp.id,
  clp.user_id,
  clp.cafe_id,
  c.name as cafe_name,
  clp.points,
  clp.total_spent,
  clp.loyalty_level,
  clp.first_order_bonus_awarded,
  clp.created_at,
  clp.updated_at
FROM public.cafe_loyalty_points clp
LEFT JOIN public.cafes c ON clp.cafe_id = c.id
LEFT JOIN public.profiles p ON clp.user_id = p.id
WHERE p.email = 'maahi.229301245@muj.manipal.edu';
