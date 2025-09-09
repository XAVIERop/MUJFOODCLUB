-- Create Munch Box Cafe Owner Account
-- This script creates a complete setup for Munch Box cafe owner

-- Step 1: Create the user in auth.users (this would be done through Supabase dashboard)
-- Email: munchbox.owner@mujfoodclub.in
-- Password: MunchBox1203!@#

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
  'munchbox.owner@mujfoodclub.in',
  'Munch Box Cafe Owner',
  'cafe_owner',
  (SELECT id FROM public.cafes WHERE name = 'Munch Box' LIMIT 1),
  0,
  'foodie',
  0,
  0,
  'CAFE_MUNCHBOX_OWNER',
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
  c.name as cafe_name,
  c.accepting_orders,
  c.priority,
  c.is_exclusive
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
WHERE p.email = 'munchbox.owner@mujfoodclub.in';

-- Step 4: Show all cafe owner accounts
SELECT 
  p.email,
  p.full_name,
  p.user_type,
  c.name as cafe_name,
  c.accepting_orders,
  c.priority,
  c.is_exclusive
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
WHERE p.user_type = 'cafe_owner'
ORDER BY c.priority ASC;

-- Step 5: Show Munch Box cafe details
SELECT 
  name,
  type,
  description,
  location,
  phone,
  hours,
  accepting_orders,
  priority,
  is_exclusive,
  average_rating,
  total_ratings
FROM public.cafes 
WHERE name = 'Munch Box';

-- Step 6: Show Munch Box menu items
SELECT 
  mi.name,
  mi.description,
  mi.price,
  mi.category,
  mi.is_available
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'Munch Box'
ORDER BY mi.category, mi.name;
