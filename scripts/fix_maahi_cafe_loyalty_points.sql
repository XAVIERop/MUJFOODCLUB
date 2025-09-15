-- Fix Maahi's cafe loyalty points to match profile
-- Run this in Supabase Dashboard → SQL Editor

-- Update cafe loyalty points to match profile data
UPDATE public.cafe_loyalty_points 
SET 
  points = 125,  -- Match profile points
  total_spent = 1325.00,  -- Match profile total spent
  loyalty_level = 1,  -- Keep as foodie
  updated_at = NOW()
WHERE user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d' 
  AND cafe_id = '25d0b247-0731-4e52-a0fb-023526adfa34';

-- Verify the fix
SELECT 
  '=== VERIFICATION - MAHI CAFE LOYALTY POINTS ===' as section,
  clp.id,
  clp.user_id,
  clp.cafe_id,
  c.name as cafe_name,
  clp.points,
  clp.total_spent,
  clp.loyalty_level,
  clp.updated_at
FROM public.cafe_loyalty_points clp
LEFT JOIN public.cafes c ON clp.cafe_id = c.id
LEFT JOIN public.profiles p ON clp.user_id = p.id
WHERE p.email = 'maahi.229301245@muj.manipal.edu';
