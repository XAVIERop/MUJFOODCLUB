-- Manual Fix for Munch Box Auth Account
-- Run this in Supabase SQL Editor

-- Step 1: Check current Munch Box cafe status
SELECT 
  id,
  name,
  accepting_orders,
  priority,
  is_exclusive,
  created_at
FROM public.cafes 
WHERE name = 'Munch Box';

-- Step 2: Check if profile exists
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.user_type,
  p.cafe_id,
  c.name as cafe_name,
  c.accepting_orders
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
WHERE p.email = 'munchbox.owner@mujfoodclub.in';

-- Step 3: Check if auth user exists (this will show if user exists in auth.users)
-- Note: This query might not work depending on RLS policies
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'munchbox.owner@mujfoodclub.in';

-- Step 4: If auth user doesn't exist, you need to create it manually:
-- 
-- OPTION A: Through Supabase Dashboard
-- 1. Go to Authentication > Users
-- 2. Click "Add User"
-- 3. Email: munchbox.owner@mujfoodclub.in
-- 4. Password: Munchbox@2024
-- 5. Auto Confirm: Yes
-- 6. User Metadata: {"full_name": "Munch Box Owner", "cafe_name": "Munch Box"}
--
-- OPTION B: Through Admin API (if you have service role key)
-- Use the create_munchbox_auth_user.js script with correct credentials

-- Step 5: After creating auth user, get the user ID and update profile
-- Replace 'AUTH_USER_ID_FROM_STEP_4' with the actual user ID
/*
UPDATE public.profiles 
SET 
  id = 'AUTH_USER_ID_FROM_STEP_4',
  updated_at = NOW()
WHERE email = 'munchbox.owner@mujfoodclub.in';
*/

-- Step 6: Verify the complete setup
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

-- Step 7: Show all working cafe owners for reference
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
