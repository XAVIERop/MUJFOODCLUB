-- Fix Munch Box Auth Account
-- This script creates the proper auth user and links it to the profile

-- Step 1: Check if Munch Box cafe exists
SELECT 
  id,
  name,
  accepting_orders,
  priority,
  is_exclusive
FROM public.cafes 
WHERE name = 'Munch Box';

-- Step 2: Check if profile exists for Munch Box
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.user_type,
  p.cafe_id,
  c.name as cafe_name
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
WHERE p.email = 'munchbox.owner@mujfoodclub.in';

-- Step 3: Create the auth user (this needs to be done through Supabase dashboard or admin API)
-- Email: munchbox.owner@mujfoodclub.in
-- Password: Munchbox@2024
-- 
-- IMPORTANT: You need to create this user through:
-- 1. Supabase Dashboard > Authentication > Users > Add User
-- 2. Or use the admin API with service role key
--
-- After creating the auth user, get the user ID and update the profile

-- Step 4: Update the profile with the correct auth user ID
-- Replace 'AUTH_USER_ID_HERE' with the actual user ID from auth.users
/*
UPDATE public.profiles 
SET 
  id = 'AUTH_USER_ID_HERE',  -- Replace with actual auth user ID
  updated_at = NOW()
WHERE email = 'munchbox.owner@mujfoodclub.in';
*/

-- Step 5: Verify the fix
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

-- Step 6: Show all cafe owner accounts for reference
SELECT 
  p.email,
  p.full_name,
  p.user_type,
  c.name as cafe_name,
  c.accepting_orders,
  c.priority
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
WHERE p.user_type = 'cafe_owner'
ORDER BY c.priority ASC;
