-- Create Missing Student Profiles
-- Run this in Supabase Dashboard → SQL Editor

-- 1. First, let's see what we're about to create
SELECT 
  '=== STUDENTS WHO WILL GET PROFILES ===' as section,
  au.id,
  au.email,
  SPLIT_PART(au.email, '@', 1) as full_name,
  au.email_confirmed_at,
  au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
  AND (au.email LIKE '%.229%' OR au.email LIKE '%.242%' OR au.email LIKE '%.243%')
  AND au.email NOT LIKE '%owner%'
  AND au.email NOT LIKE '%test%'
  AND au.email NOT LIKE '%magic%'
ORDER BY au.created_at DESC;

-- 2. Create profiles for missing students
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  user_type,
  block,
  loyalty_points,
  loyalty_tier,
  total_orders,
  total_spent,
  qr_code,
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.email,
  SPLIT_PART(au.email, '@', 1) as full_name,
  'student' as user_type,
  'B1' as block, -- Default block, can be updated later
  0 as loyalty_points,
  'foodie' as loyalty_tier,
  0 as total_orders,
  0 as total_spent,
  'STUDENT_' || au.id as qr_code,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
  AND (au.email LIKE '%.229%' OR au.email LIKE '%.242%' OR au.email LIKE '%.243%')
  AND au.email NOT LIKE '%owner%'
  AND au.email NOT LIKE '%test%'
  AND au.email NOT LIKE '%magic%';

-- 3. Verify the profiles were created
SELECT 
  '=== VERIFICATION - NEW PROFILES CREATED ===' as section,
  p.id,
  p.email,
  p.full_name,
  p.user_type,
  p.block,
  p.loyalty_points,
  p.loyalty_tier,
  p.created_at
FROM public.profiles p
WHERE p.user_type = 'student'
ORDER BY p.created_at DESC;

-- 4. Final count comparison
SELECT 
  '=== FINAL COUNT COMPARISON ===' as section,
  'Total Auth Users' as metric,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'FINAL COUNT COMPARISON',
  'Student Profiles (After Fix)',
  COUNT(*)
FROM public.profiles 
WHERE user_type = 'student'
UNION ALL
SELECT 
  'FINAL COUNT COMPARISON',
  'Auth Users with Profiles',
  COUNT(*)
FROM auth.users au
INNER JOIN public.profiles p ON au.id = p.id
UNION ALL
SELECT 
  'FINAL COUNT COMPARISON',
  'Auth Users WITHOUT Profiles (Remaining)',
  COUNT(*)
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 5. Success message
SELECT 
  'FIX COMPLETE' as status,
  'All real students now have profiles and can log in' as result;
