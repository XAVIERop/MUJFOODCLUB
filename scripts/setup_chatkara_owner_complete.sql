-- Complete Chatkara Cafe Owner Setup
-- Run this in Supabase Dashboard → SQL Editor

-- 1. First, check if Chatkara cafe exists
SELECT 
  'Checking Chatkara cafe...' as step,
  id,
  name,
  type,
  location,
  is_active
FROM public.cafes 
WHERE name ILIKE '%chatkara%' OR name = 'CHATKARA';

-- 2. Check if auth user exists
SELECT 
  'Checking auth user...' as step,
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'chatkara.owner@mujfoodclub.in';

-- 3. Check if profile exists
SELECT 
  'Checking profile...' as step,
  id,
  email,
  full_name,
  user_type,
  cafe_id
FROM public.profiles 
WHERE email = 'chatkara.owner@mujfoodclub.in';

-- 4. If Chatkara cafe doesn't exist, create it
INSERT INTO public.cafes (
  id,
  name,
  type,
  description,
  location,
  phone,
  hours,
  image_url,
  rating,
  total_reviews,
  is_active
) 
SELECT 
  gen_random_uuid(),
  'Chatkara',
  'Cafe',
  'Delicious snacks and beverages',
  'MUJ Campus',
  '+91-9876543210',
  '8:00 AM - 10:00 PM',
  'chatkara_logo.jpg',
  0.0,
  0,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.cafes WHERE name = 'Chatkara'
);

-- 5. Get the Chatkara cafe ID
SELECT 
  'Chatkara cafe ID:' as info,
  id as cafe_id,
  name
FROM public.cafes 
WHERE name = 'Chatkara'
LIMIT 1;

-- 6. Create the profile (replace USER_ID with actual auth user ID)
-- You'll need to get the USER_ID from step 2 above
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  user_type,
  cafe_id,
  loyalty_points,
  loyalty_tier,
  total_orders,
  total_spent,
  qr_code,
  created_at,
  updated_at
) 
SELECT 
  au.id,
  'chatkara.owner@mujfoodclub.in',
  'Chatkara Cafe Owner',
  'cafe_owner',
  c.id,
  0,
  'foodie',
  0,
  0,
  'CAFE_CHATKARA_OWNER_' || au.id,
  NOW(),
  NOW()
FROM auth.users au
CROSS JOIN public.cafes c
WHERE au.email = 'chatkara.owner@mujfoodclub.in'
  AND c.name = 'Chatkara'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.email = 'chatkara.owner@mujfoodclub.in'
  );

-- 7. Verify the setup
SELECT 
  'VERIFICATION - Chatkara Owner Setup:' as section,
  p.id,
  p.email,
  p.full_name,
  p.user_type,
  p.cafe_id,
  c.name as cafe_name,
  au.email_confirmed_at,
  au.last_sign_in_at
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.email = 'chatkara.owner@mujfoodclub.in';

-- 8. Final summary
SELECT 
  'SETUP COMPLETE' as status,
  'Chatkara Owner Account' as account_type,
  'Ready to use' as status_description;
