-- Check Cook House account status
-- This will show us if Cook House owner is properly set up

-- Check 1: Does the Cook House auth account exist?
SELECT 
  'Auth Account' as check_type,
  au.id,
  au.email,
  au.created_at,
  au.email_confirmed_at
FROM auth.users au
WHERE au.email = 'cookhouse.owner@mujfoodclub.in';

-- Check 2: Does the Cook House profile exist?
SELECT 
  'Profile Status' as check_type,
  p.id,
  p.full_name,
  p.email,
  p.user_type,
  p.cafe_id,
  p.block,
  p.created_at,
  p.updated_at
FROM profiles p
WHERE p.email = 'cookhouse.owner@mujfoodclub.in';

-- Check 3: Does cafe_staff entry exist?
SELECT 
  'Cafe Staff Status' as check_type,
  cs.user_id,
  cs.cafe_id,
  cs.role,
  cs.is_active,
  p.full_name,
  c.name as cafe_name
FROM cafe_staff cs
JOIN profiles p ON cs.user_id = p.id
JOIN cafes c ON cs.cafe_id = c.id
WHERE p.email = 'cookhouse.owner@mujfoodclub.in';

-- Check 4: What's the Cook House cafe ID?
SELECT 
  'Cook House Cafe' as check_type,
  c.id,
  c.name,
  c.location,
  c.is_active
FROM cafes c
WHERE c.name = 'COOK HOUSE';
