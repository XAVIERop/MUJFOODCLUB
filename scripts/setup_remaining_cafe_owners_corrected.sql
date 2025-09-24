-- Corrected setup for remaining cafe owners
-- This script explicitly sets user_type to 'cafe_owner' to override the default

-- Step 1: Create profiles for remaining cafe owners
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
    WHEN au.email = 'punjabitadka.owner@mujfoodclub.in' THEN 'Punjabi Tadka Owner'
    WHEN au.email = 'munchbox.owner@mujfoodclub.in' THEN 'Munch Box Owner'
  END as full_name,
  au.email,
  CASE 
    WHEN au.email = 'cookhouse.owner@mujfoodclub.in' THEN 'G1'
    WHEN au.email = 'punjabitadka.owner@mujfoodclub.in' THEN 'G1'
    WHEN au.email = 'munchbox.owner@mujfoodclub.in' THEN 'G1'
  END as block,
  'cafe_owner' as user_type, -- Explicitly set to override default
  CASE 
    WHEN au.email = 'cookhouse.owner@mujfoodclub.in' THEN (SELECT id FROM cafes WHERE name = 'COOK HOUSE' LIMIT 1)
    WHEN au.email = 'punjabitadka.owner@mujfoodclub.in' THEN (SELECT id FROM cafes WHERE name = 'Punjabi Tadka' LIMIT 1)
    WHEN au.email = 'munchbox.owner@mujfoodclub.in' THEN (SELECT id FROM cafes WHERE name = 'Munch Box' LIMIT 1)
  END as cafe_id,
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email IN (
  'cookhouse.owner@mujfoodclub.in',
  'punjabitadka.owner@mujfoodclub.in',
  'munchbox.owner@mujfoodclub.in'
)
AND NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = au.id
);

-- Step 2: Create cafe_staff entries
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
  'punjabitadka.owner@mujfoodclub.in',
  'munchbox.owner@mujfoodclub.in'
)
AND NOT EXISTS (
  SELECT 1 FROM cafe_staff cs 
  WHERE cs.user_id = p.id AND cs.cafe_id = p.cafe_id
);

-- Step 3: Verify all setups
SELECT 
  'All Cafe Owners Status' as check_type,
  p.full_name,
  p.email,
  p.user_type,
  p.cafe_id,
  c.name as cafe_name,
  cs.role,
  cs.is_active
FROM profiles p
LEFT JOIN cafes c ON p.cafe_id = c.id
LEFT JOIN cafe_staff cs ON cs.user_id = p.id AND cs.cafe_id = p.cafe_id
WHERE p.email IN (
  'minimeals.owner@mujfoodclub.in',
  'foodcourt.owner@mujfoodclub.in',
  'chatkara.owner@mujfoodclub.in',
  'cookhouse.owner@mujfoodclub.in',
  'punjabitadka.owner@mujfoodclub.in',
  'munchbox.owner@mujfoodclub.in'
)
ORDER BY p.email;
