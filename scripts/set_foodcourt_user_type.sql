-- Set user_type for Food Court owner
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
  p.updated_at
FROM profiles p
WHERE p.email = 'foodcourt.owner@mujfoodclub.in';
