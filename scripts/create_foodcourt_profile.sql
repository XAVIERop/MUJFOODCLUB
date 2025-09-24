-- Create profile for Food Court cafe owner
-- This script creates the missing profile for foodcourt.owner@mujfoodclub.in

-- First, let's get the user ID for the Food Court owner
-- Then create the profile record

INSERT INTO profiles (
  id,
  full_name,
  email,
  block,
  created_at,
  updated_at
)
SELECT 
  au.id,
  'Food Court Owner',
  'foodcourt.owner@mujfoodclub.in',
  'G1', -- Food Court is located at G1 Ground Floor, GHS
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'foodcourt.owner@mujfoodclub.in'
AND NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = au.id
);

-- Verify the profile was created
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.block,
  p.created_at,
  au.email as auth_email,
  au.email_confirmed_at
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.email = 'foodcourt.owner@mujfoodclub.in';
