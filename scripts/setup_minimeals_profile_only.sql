-- Setup Mini Meals profile (assuming auth account exists)
-- This script creates the profile and cafe_staff entry

-- Create profile for Mini Meals owner
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

-- Create cafe_staff entry
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

-- Verify setup
SELECT 
  'Mini Meals Setup Complete' as status,
  p.id,
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
WHERE p.email = 'minimeals.owner@mujfoodclub.in';
