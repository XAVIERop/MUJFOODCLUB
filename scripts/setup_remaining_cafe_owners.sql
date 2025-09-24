-- Complete setup for Cook House, Mini Meals, Punjabi Tadka, and Munch Box cafe owners
-- This script creates profiles, sets permissions, and links to cafes

-- Step 1: Create profiles for all cafe owners
INSERT INTO profiles (
  id,
  full_name,
  email,
  block,
  user_type,
  cafe_id,
  created_at,
  updated_at
)
SELECT 
  au.id,
  CASE 
    WHEN au.email = 'cookhouse.owner@mujfoodclub.in' THEN 'Cook House Owner'
    WHEN au.email = 'minimeals.owner@mujfoodclub.in' THEN 'Mini Meals Owner'
    WHEN au.email = 'punjabitadka.owner@mujfoodclub.in' THEN 'Punjabi Tadka Owner'
    WHEN au.email = 'munchbox.owner@mujfoodclub.in' THEN 'Munch Box Owner'
  END as full_name,
  au.email,
  CASE 
    WHEN au.email = 'cookhouse.owner@mujfoodclub.in' THEN 'G1'
    WHEN au.email = 'minimeals.owner@mujfoodclub.in' THEN 'B1'
    WHEN au.email = 'punjabitadka.owner@mujfoodclub.in' THEN 'G1'
    WHEN au.email = 'munchbox.owner@mujfoodclub.in' THEN 'G1'
  END as block,
  'cafe_owner' as user_type,
  CASE 
    WHEN au.email = 'cookhouse.owner@mujfoodclub.in' THEN (SELECT id FROM cafes WHERE name = 'COOK HOUSE' LIMIT 1)
    WHEN au.email = 'minimeals.owner@mujfoodclub.in' THEN (SELECT id FROM cafes WHERE name = 'Mini Meals' LIMIT 1)
    WHEN au.email = 'punjabitadka.owner@mujfoodclub.in' THEN (SELECT id FROM cafes WHERE name = 'Punjabi Tadka' LIMIT 1)
    WHEN au.email = 'munchbox.owner@mujfoodclub.in' THEN (SELECT id FROM cafes WHERE name = 'Munch Box' LIMIT 1)
  END as cafe_id,
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email IN (
  'cookhouse.owner@mujfoodclub.in',
  'minimeals.owner@mujfoodclub.in', 
  'punjabitadka.owner@mujfoodclub.in',
  'munchbox.owner@mujfoodclub.in'
)
AND NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = au.id
);

-- Step 2: Create cafe_staff entries for all cafe owners
INSERT INTO cafe_staff (
  user_id,
  cafe_id,
  role,
  is_active,
  created_at,
  updated_at
)
SELECT 
  p.id,
  p.cafe_id,
  'owner',
  true,
  NOW(),
  NOW()
FROM profiles p
WHERE p.email IN (
  'cookhouse.owner@mujfoodclub.in',
  'minimeals.owner@mujfoodclub.in',
  'punjabitadka.owner@mujfoodclub.in',
  'munchbox.owner@mujfoodclub.in'
)
AND NOT EXISTS (
  SELECT 1 FROM cafe_staff cs 
  WHERE cs.user_id = p.id AND cs.cafe_id = p.cafe_id
);

-- Step 3: Verify all setups
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.user_type,
  p.cafe_id,
  p.block,
  c.name as cafe_name,
  p.created_at,
  p.updated_at
FROM profiles p
LEFT JOIN cafes c ON p.cafe_id = c.id
WHERE p.email IN (
  'cookhouse.owner@mujfoodclub.in',
  'minimeals.owner@mujfoodclub.in',
  'punjabitadka.owner@mujfoodclub.in',
  'munchbox.owner@mujfoodclub.in'
)
ORDER BY p.email;

-- Step 4: Verify cafe_staff entries
SELECT 
  cs.user_id,
  cs.cafe_id,
  cs.role,
  cs.is_active,
  p.full_name,
  c.name as cafe_name
FROM cafe_staff cs
JOIN profiles p ON cs.user_id = p.id
JOIN cafes c ON cs.cafe_id = c.id
WHERE p.email IN (
  'cookhouse.owner@mujfoodclub.in',
  'minimeals.owner@mujfoodclub.in',
  'punjabitadka.owner@mujfoodclub.in',
  'munchbox.owner@mujfoodclub.in'
)
ORDER BY p.email;
