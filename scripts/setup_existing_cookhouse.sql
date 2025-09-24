-- Setup existing Cook House auth account
-- This script creates profile and links to COOK HOUSE cafe

-- Step 1: Create profile for existing Cook House owner
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
  'Cook House Owner',
  'cookhouse.owner@mujfoodclub.in',
  'G1',
  'cafe_owner',
  '48cabbce-6b24-4be6-8be6-f2f01f21752b', -- Cook House cafe ID
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'cookhouse.owner@mujfoodclub.in'
AND NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = au.id
);

-- Step 2: Update profile if it exists but is wrong
UPDATE profiles 
SET 
  full_name = 'Cook House Owner',
  block = 'G1',
  user_type = 'cafe_owner',
  cafe_id = '48cabbce-6b24-4be6-8be6-f2f01f21752b',
  updated_at = NOW()
WHERE email = 'cookhouse.owner@mujfoodclub.in';

-- Step 3: Create cafe_staff entry
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
WHERE p.email = 'cookhouse.owner@mujfoodclub.in'
AND NOT EXISTS (
  SELECT 1 FROM cafe_staff cs 
  WHERE cs.user_id = p.id AND cs.cafe_id = p.cafe_id
);

-- Step 4: Verify complete setup
SELECT 
  'Cook House Setup Complete' as status,
  p.id,
  p.full_name,
  p.email,
  p.user_type,
  p.cafe_id,
  p.block,
  c.name as cafe_name,
  cs.role,
  cs.is_active,
  p.created_at,
  p.updated_at
FROM profiles p
LEFT JOIN cafes c ON p.cafe_id = c.id
LEFT JOIN cafe_staff cs ON cs.user_id = p.id AND cs.cafe_id = p.cafe_id
WHERE p.email = 'cookhouse.owner@mujfoodclub.in';
