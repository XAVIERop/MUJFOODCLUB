-- Verify Student Profiles Were Created
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Check total student profiles now
SELECT 
  '=== CURRENT STUDENT PROFILES ===' as section,
  COUNT(*) as total_student_profiles
FROM public.profiles 
WHERE user_type = 'student';

-- 2. Show all student profiles
SELECT 
  '=== ALL STUDENT PROFILES ===' as section,
  p.id,
  p.email,
  p.full_name,
  p.block,
  p.loyalty_points,
  p.loyalty_tier,
  p.total_orders,
  p.total_spent,
  p.created_at,
  au.email_confirmed_at,
  au.last_sign_in_at
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.user_type = 'student'
ORDER BY p.created_at DESC;

-- 3. Check if any auth users still don't have profiles
SELECT 
  '=== AUTH USERS STILL WITHOUT PROFILES ===' as section,
  COUNT(*) as count
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 4. Show remaining auth users without profiles (if any)
SELECT 
  '=== REMAINING USERS WITHOUT PROFILES ===' as section,
  au.id,
  au.email,
  au.email_confirmed_at,
  au.created_at,
  CASE 
    WHEN au.email LIKE '%owner%' THEN 'CAFE OWNER'
    WHEN au.email LIKE '%test%' THEN 'TEST ACCOUNT'
    WHEN au.email LIKE '%magic%' THEN 'MAGIC LINK TEST'
    ELSE 'OTHER'
  END as account_type
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- 5. Final summary
SELECT 
  '=== FINAL SUMMARY ===' as section,
  'Total Auth Users' as metric,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'FINAL SUMMARY',
  'Student Profiles',
  COUNT(*)
FROM public.profiles 
WHERE user_type = 'student'
UNION ALL
SELECT 
  'FINAL SUMMARY',
  'Cafe Owner Profiles',
  COUNT(*)
FROM public.profiles 
WHERE user_type = 'cafe_owner'
UNION ALL
SELECT 
  'FINAL SUMMARY',
  'Auth Users with Profiles',
  COUNT(*)
FROM auth.users au
INNER JOIN public.profiles p ON au.id = p.id
UNION ALL
SELECT 
  'FINAL SUMMARY',
  'Auth Users WITHOUT Profiles',
  COUNT(*)
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
