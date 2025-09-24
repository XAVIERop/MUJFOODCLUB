-- Fix Food Court cafe owner permissions
-- This script sets the user_type to 'cafe_owner' for the Food Court profile

-- Update the profile to set user_type as cafe_owner
UPDATE profiles 
SET 
  user_type = 'cafe_owner',
  updated_at = NOW()
WHERE email = 'foodcourt.owner@mujfoodclub.in';

-- Verify the update
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.user_type,
  p.block,
  p.created_at,
  p.updated_at
FROM profiles p
WHERE p.email = 'foodcourt.owner@mujfoodclub.in';

-- Also check if we need to add to cafe_staff table
-- (This might be needed for additional permissions)
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
  c.id,
  'owner',
  true,
  NOW(),
  NOW()
FROM profiles p
JOIN cafes c ON c.name = 'FOOD COURT'
WHERE p.email = 'foodcourt.owner@mujfoodclub.in'
AND NOT EXISTS (
  SELECT 1 FROM cafe_staff cs 
  WHERE cs.user_id = p.id AND cs.cafe_id = c.id
);

-- Verify cafe_staff entry
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
WHERE p.email = 'foodcourt.owner@mujfoodclub.in';
