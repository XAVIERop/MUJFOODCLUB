-- Fix Food Court owner's cafe_id in profile
-- This script sets the cafe_id field for the Food Court owner profile

-- First, get the Food Court cafe ID
-- Then update the profile to include the cafe_id

UPDATE profiles 
SET 
  cafe_id = (
    SELECT id 
    FROM cafes 
    WHERE name = 'FOOD COURT' 
    LIMIT 1
  ),
  updated_at = NOW()
WHERE email = 'foodcourt.owner@mujfoodclub.in';

-- Verify the update
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.user_type,
  p.cafe_id,
  p.block,
  c.name as cafe_name,
  p.updated_at
FROM profiles p
LEFT JOIN cafes c ON p.cafe_id = c.id
WHERE p.email = 'foodcourt.owner@mujfoodclub.in';

-- Also verify the cafe_staff entry is correct
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
