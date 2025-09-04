-- Simple Reset Using Existing Columns Only
-- Run this in Supabase Dashboard → SQL Editor

-- Reset the test user profile using only existing columns
UPDATE public.profiles 
SET 
  loyalty_points = 0,
  total_orders = 0,
  total_spent = 0,
  loyalty_tier = 'foodie',
  is_new_user = true,
  new_user_orders_count = 0
WHERE email = 'test@muj.manipal.edu';

-- Verify the reset
SELECT 
  'Test user profile reset to:' as status,
  email,
  full_name,
  loyalty_points,
  total_orders,
  total_spent,
  loyalty_tier,
  is_new_user,
  new_user_orders_count
FROM public.profiles 
WHERE email = 'test@muj.manipal.edu';
