-- Fix Mini Meals owner's cafe_id in profile
-- This script updates the profile to include the correct cafe_id

-- Step 1: Update the profile with the correct cafe_id
UPDATE profiles 
SET 
  cafe_id = 'b09e9dcb-f7e2-4eac-87f1-a4555c4ecde7', -- Mini Meals cafe ID
  updated_at = NOW()
WHERE email = 'minimeals.owner@mujfoodclub.in';

-- Step 2: Delete any existing cafe_staff entries with null cafe_id
DELETE FROM cafe_staff 
WHERE user_id = (
  SELECT id FROM profiles WHERE email = 'minimeals.owner@mujfoodclub.in'
)
AND cafe_id IS NULL;

-- Step 3: Create the correct cafe_staff entry
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
AND p.cafe_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM cafe_staff cs 
  WHERE cs.user_id = p.id AND cs.cafe_id = p.cafe_id
);

-- Step 4: Verify the fix
SELECT 
  'Mini Meals Fix Complete' as status,
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
