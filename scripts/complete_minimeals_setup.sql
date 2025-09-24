-- Complete Mini Meals setup
-- This script ensures Mini Meals owner has everything needed

-- Step 1: Create profile if it doesn't exist
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
  'Mini Meals Owner',
  'minimeals.owner@mujfoodclub.in',
  'B1',
  'cafe_owner',
  'b09e9dcb-f7e2-4eac-87f1-a4555c4ecde7', -- Mini Meals cafe ID
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'minimeals.owner@mujfoodclub.in'
AND NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = au.id
);

-- Step 2: Update profile if it exists but is wrong
UPDATE profiles 
SET 
  full_name = 'Mini Meals Owner',
  block = 'B1',
  user_type = 'cafe_owner',
  cafe_id = 'b09e9dcb-f7e2-4eac-87f1-a4555c4ecde7',
  updated_at = NOW()
WHERE email = 'minimeals.owner@mujfoodclub.in';

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
WHERE p.email = 'minimeals.owner@mujfoodclub.in'
AND NOT EXISTS (
  SELECT 1 FROM cafe_staff cs 
  WHERE cs.user_id = p.id AND cs.cafe_id = p.cafe_id
);

-- Step 4: Verify complete setup
SELECT 
  'Mini Meals Complete Setup' as status,
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
WHERE p.email = 'minimeals.owner@mujfoodclub.in';
