-- Reset Test User Account
-- Run this in Supabase Dashboard → SQL Editor

-- 1. First, let's find the test user
SELECT 
  'Finding test user...' as step,
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'test@muj.manipal.edu';

-- 2. Delete all orders for the test user
DELETE FROM public.orders 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'test@muj.manipal.edu'
);

-- 3. Delete all order items for the test user
DELETE FROM public.order_items 
WHERE order_id IN (
  SELECT id FROM public.orders 
  WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'test@muj.manipal.edu'
  )
);

-- 4. Delete all loyalty transactions for the test user
DELETE FROM public.loyalty_transactions 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'test@muj.manipal.edu'
);

-- 5. Reset the user's profile to initial state
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

-- 6. Verify the reset
SELECT 
  'Profile after reset:' as step,
  id,
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

-- 7. Check if any orders remain
SELECT 
  'Remaining orders:' as step,
  COUNT(*) as order_count
FROM public.orders 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'test@muj.manipal.edu'
);

-- 8. Check if any loyalty transactions remain
SELECT 
  'Remaining loyalty transactions:' as step,
  COUNT(*) as transaction_count
FROM public.loyalty_transactions 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'test@muj.manipal.edu'
);
