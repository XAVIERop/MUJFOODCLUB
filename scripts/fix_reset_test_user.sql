-- Fix Reset Test User (Add Missing Column First)
-- Run this in Supabase Dashboard → SQL Editor

-- 1. First, add the missing monthly_spending column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS monthly_spending DECIMAL(10,2) DEFAULT 0;

-- 2. Add the missing last_maintenance_reset column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_maintenance_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Now reset the test user profile
UPDATE public.profiles 
SET 
  loyalty_points = 0,
  total_orders = 0,
  total_spent = 0,
  monthly_spending = 0,
  loyalty_tier = 'foodie',
  is_new_user = true,
  new_user_orders_count = 0,
  last_maintenance_reset = NOW()
WHERE email = 'test@muj.manipal.edu';

-- 4. Verify the reset
SELECT 
  'Test user profile reset to:' as status,
  email,
  full_name,
  loyalty_points,
  total_orders,
  total_spent,
  monthly_spending,
  loyalty_tier,
  is_new_user,
  new_user_orders_count
FROM public.profiles 
WHERE email = 'test@muj.manipal.edu';
