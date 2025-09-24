-- Create auth account and profile for Mini Meals owner
-- This script creates the complete setup for Mini Meals

-- Step 1: Create auth.users entry (if it doesn't exist)
-- Note: This might need to be done through Supabase Auth UI or API
-- For now, let's check if we can create it directly

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
SELECT 
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'minimeals.owner@mujfoodclub.in',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'minimeals.owner@mujfoodclub.in'
);

-- Step 2: Create profile for Mini Meals owner
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
  'Final Verification' as check_type,
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
