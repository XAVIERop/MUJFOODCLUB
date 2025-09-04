-- Check user status for test@muj.manipal.edu

-- 1. Check if user exists in auth.users (this requires admin access)
-- Note: This query might not work from the dashboard due to RLS
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'test@muj.manipal.edu';

-- 2. Check if profile exists
SELECT 
  id,
  email,
  full_name,
  user_type,
  block,
  loyalty_tier,
  loyalty_points,
  total_orders,
  total_spent,
  created_at
FROM public.profiles 
WHERE email = 'test@muj.manipal.edu';

-- 3. Check if there are any orders for this user
SELECT 
  o.id,
  o.order_number,
  o.total_amount,
  o.status,
  o.created_at
FROM public.orders o
JOIN public.profiles p ON o.user_id = p.id
WHERE p.email = 'test@muj.manipal.edu';

-- 4. Check loyalty transactions
SELECT 
  lt.id,
  lt.points_change,
  lt.transaction_type,
  lt.description,
  lt.created_at
FROM public.loyalty_transactions lt
JOIN public.profiles p ON lt.user_id = p.id
WHERE p.email = 'test@muj.manipal.edu';
