-- Check what user types exist in the system
-- This will help us understand the available user types

-- Check 1: What user_type values exist in profiles?
SELECT 
  'User Types in Profiles' as check_type,
  user_type,
  COUNT(*) as count
FROM profiles 
WHERE user_type IS NOT NULL
GROUP BY user_type
ORDER BY count DESC;

-- Check 2: Check the Mini Meals profile specifically
SELECT 
  'Mini Meals Profile' as check_type,
  id,
  full_name,
  email,
  user_type,
  cafe_id,
  block,
  created_at,
  updated_at
FROM profiles 
WHERE email = 'minimeals.owner@mujfoodclub.in';

-- Check 3: What are the possible user_type values?
-- Let's check if there's an enum or constraint
SELECT 
  'Schema Info' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'user_type';
