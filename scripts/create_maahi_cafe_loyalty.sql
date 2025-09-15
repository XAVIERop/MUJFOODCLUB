-- Create Maahi's cafe loyalty points record
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Create Maahi's cafe_loyalty_points record for CHATKARA
INSERT INTO public.cafe_loyalty_points (
  user_id,
  cafe_id,
  points,
  total_spent,
  loyalty_level,
  first_order_bonus_awarded,
  created_at,
  updated_at
)
VALUES (
  'a4a6bc64-378a-4c94-9dbf-622140428c9d', -- Maahi's user ID
  '25d0b247-0731-4e52-a0fb-023526adfa34', -- CHATKARA cafe ID
  75, -- Correct points (75)
  475.00, -- Correct total spent (₹475)
  1, -- Loyalty level 1 (foodie)
  TRUE, -- First order bonus awarded (50 points + 25 points = 75 total)
  NOW(),
  NOW()
);

-- 2. Verify the record was created
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
