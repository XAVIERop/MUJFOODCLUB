-- Setup Punjabi Tadka cafe owner
-- Creates profile, sets permissions, and links to Punjabi Tadka cafe

-- Create profile for Punjabi Tadka owner
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
  'Punjabi Tadka Owner',
  'punjabitadka.owner@mujfoodclub.in',
  'G1',
  'cafe_owner',
  (SELECT id FROM cafes WHERE name = 'Punjabi Tadka' LIMIT 1),
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'punjabitadka.owner@mujfoodclub.in'
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
WHERE p.email = 'punjabitadka.owner@mujfoodclub.in'
AND NOT EXISTS (
  SELECT 1 FROM cafe_staff cs 
  WHERE cs.user_id = p.id AND cs.cafe_id = p.cafe_id
);

-- Verify setup
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.user_type,
  p.cafe_id,
  c.name as cafe_name
FROM profiles p
LEFT JOIN cafes c ON p.cafe_id = c.id
WHERE p.email = 'punjabitadka.owner@mujfoodclub.in';
