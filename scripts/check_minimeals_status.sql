-- Diagnostic script to check Mini Meals setup status
-- This will help us understand what's missing

-- Check 1: Does the Mini Meals owner account exist in auth.users?
SELECT 
  'Auth Users Check' as check_type,
  au.id,
  au.email,
  au.created_at,
  au.email_confirmed_at
FROM auth.users au
WHERE au.email = 'minimeals.owner@mujfoodclub.in';

-- Check 2: Does the Mini Meals cafe exist?
SELECT 
  'Cafe Check' as check_type,
  c.id,
  c.name,
  c.location,
  c.is_active
FROM cafes c
WHERE c.name ILIKE '%mini%meals%' OR c.name ILIKE '%mini meals%';

-- Check 3: Does the profile already exist?
SELECT 
  'Profile Check' as check_type,
  p.id,
  p.full_name,
  p.email,
  p.user_type,
  p.cafe_id,
  p.created_at
FROM profiles p
WHERE p.email = 'minimeals.owner@mujfoodclub.in';

-- Check 4: What cafes do we have that might match?
SELECT 
  'All Cafes' as check_type,
  c.id,
  c.name,
  c.location
FROM cafes c
WHERE c.name ILIKE '%mini%' OR c.name ILIKE '%meal%'
ORDER BY c.name;
