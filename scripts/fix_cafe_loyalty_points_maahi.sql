-- Fix Maahi's Cafe Loyalty Points Data
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Check if Maahi has cafe_loyalty_points record
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

-- 2. Check what cafe Maahi ordered from
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

-- 3. Create or update Maahi's cafe_loyalty_points record
INSERT INTO public.cafe_loyalty_points (
  user_id,
  cafe_id,
  points,
  total_spent,
  loyalty_level,
  created_at,
  updated_at
)
SELECT 
  p.id as user_id,
  o.cafe_id,
  75 as points,  -- Correct points
  475.00 as total_spent,  -- Correct amount
  1 as loyalty_level,  -- 1 = foodie, 2 = gourmet, 3 = connoisseur
  NOW() as created_at,
  NOW() as updated_at
FROM public.profiles p
CROSS JOIN public.orders o
LEFT JOIN public.cafes c ON o.cafe_id = c.id
WHERE p.email = 'maahi.229301245@muj.manipal.edu'
  AND o.user_id = p.id
  AND o.status = 'completed'
  AND NOT EXISTS (
    SELECT 1 FROM public.cafe_loyalty_points clp 
    WHERE clp.user_id = p.id AND clp.cafe_id = o.cafe_id
  )
LIMIT 1;

-- 4. If record exists, update it
UPDATE public.cafe_loyalty_points 
SET 
  points = 75,
  total_spent = 475.00,
  loyalty_level = 1,  -- 1 = foodie
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM public.profiles WHERE email = 'maahi.229301245@muj.manipal.edu'
);

-- 5. Verify the fix
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
