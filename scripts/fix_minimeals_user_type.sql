-- Fix Mini Meals owner's user_type
-- This script updates the user_type from 'student' to 'cafe_owner'

-- Step 1: Update the user_type
UPDATE profiles 
SET 
  user_type = 'cafe_owner',
  updated_at = NOW()
WHERE email = 'minimeals.owner@mujfoodclub.in';

-- Step 2: Verify the update
SELECT 
  'Mini Meals User Type Fixed' as status,
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

-- Step 3: Check what user types we have in the system
SELECT 
  'All User Types' as info,
  user_type,
  COUNT(*) as count
FROM profiles 
WHERE user_type IS NOT NULL
GROUP BY user_type
ORDER BY count DESC;
