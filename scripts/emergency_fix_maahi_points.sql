-- Emergency Fix for Maahi's Points Issue
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Check current status
SELECT 
  'BEFORE FIX - Maahi Status:' as section,
  p.email,
  p.loyalty_points,
  p.total_spent,
  p.total_orders,
  p.loyalty_tier
FROM public.profiles p
WHERE p.email = 'maahi.229301245@muj.manipal.edu';

-- 2. Fix Maahi's profile data
UPDATE public.profiles 
SET 
  total_spent = 475.00,  -- Correct amount (half of 950)
  loyalty_points = 75,   -- Correct points (47 base + 50 bonus - 22 redeemed)
  updated_at = NOW()
WHERE email = 'maahi.229301245@muj.manipal.edu';

-- 3. Fix the order data if it exists
UPDATE public.orders 
SET 
  total_amount = 475.00,  -- Ensure order amount is correct
  points_earned = 75,     -- Ensure order points are correct
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM public.profiles WHERE email = 'maahi.229301245@muj.manipal.edu'
);

-- 4. Fix loyalty transactions
UPDATE public.loyalty_transactions 
SET 
  points_change = 75,     -- Correct points
  description = 'Points earned for completed order: 47 base + 50 bonus - 22 redeemed',
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM public.profiles WHERE email = 'maahi.229301245@muj.manipal.edu'
);

-- 5. Verify the fix
SELECT 
  'AFTER FIX - Maahi Status:' as section,
  p.email,
  p.loyalty_points,
  p.total_spent,
  p.total_orders,
  p.loyalty_tier,
  p.updated_at
FROM public.profiles p
WHERE p.email = 'maahi.229301245@muj.manipal.edu';

-- 6. Check order data
SELECT 
  'Order Data:' as section,
  o.id,
  o.total_amount,
  o.points_earned,
  o.status,
  o.updated_at
FROM public.orders o
WHERE o.user_id = (
  SELECT id FROM public.profiles WHERE email = 'maahi.229301245@muj.manipal.edu'
)
ORDER BY o.created_at DESC;

-- 7. Check loyalty transactions
SELECT 
  'Loyalty Transactions:' as section,
  lt.id,
  lt.points_change,
  lt.transaction_type,
  lt.description,
  lt.updated_at
FROM public.loyalty_transactions lt
WHERE lt.user_id = (
  SELECT id FROM public.profiles WHERE email = 'maahi.229301245@muj.manipal.edu'
)
ORDER BY lt.created_at DESC;
