-- Fix user_type for all cafe owners
-- This script updates user_type from 'student' to 'cafe_owner' for all cafe owners

-- Step 1: Update Mini Meals owner
UPDATE profiles 
SET 
  user_type = 'cafe_owner',
  updated_at = NOW()
WHERE email = 'minimeals.owner@mujfoodclub.in';

-- Step 2: Update Food Court owner (if needed)
UPDATE profiles 
SET 
  user_type = 'cafe_owner',
  updated_at = NOW()
WHERE email = 'foodcourt.owner@mujfoodclub.in'
AND user_type != 'cafe_owner';

-- Step 3: Update Chatkara owner (if needed)
UPDATE profiles 
SET 
  user_type = 'cafe_owner',
  updated_at = NOW()
WHERE email = 'chatkara.owner@mujfoodclub.in'
AND user_type != 'cafe_owner';

-- Step 4: Verify all cafe owners have correct user_type
SELECT 
  'Cafe Owners Status' as check_type,
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
  'chatkara.owner@mujfoodclub.in'
)
ORDER BY p.email;

-- Step 5: Check what user types exist in the system
SELECT 
  'User Type Distribution' as info,
  user_type,
  COUNT(*) as count
FROM profiles 
WHERE user_type IS NOT NULL
GROUP BY user_type
ORDER BY count DESC;
