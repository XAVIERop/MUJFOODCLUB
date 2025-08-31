-- Create Chatkara Cafe Owner Account
-- This script creates a pre-configured account for Chatkara cafe

-- Step 1: Create the user in auth.users (this would be done through Supabase dashboard)
-- Email: chatkara.owner@mujfoodclub.in
-- Password: Chatkara1203!@#

-- Step 2: Create the profile for the cafe owner
-- Note: Replace 'USER_ID_FROM_AUTH' with the actual user ID from auth.users

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
) VALUES (
  'USER_ID_FROM_AUTH', -- Replace with actual user ID from auth.users
  'chatkara.owner@mujfoodclub.in',
  'Chatkara Cafe Owner',
  'cafe_owner',
  (SELECT id FROM public.cafes WHERE name = 'Chatkara' LIMIT 1),
  0,
  'foodie',
  0,
  0,
  'CAFE_CHATKARA_OWNER',
  NOW(),
  NOW()
);

-- Step 3: Verify the profile was created
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.user_type,
  p.cafe_id,
  c.name as cafe_name
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
WHERE p.email = 'chatkara.owner@mujfoodclub.in';
