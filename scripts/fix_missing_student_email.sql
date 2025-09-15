-- Fix Missing Student Email
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Check for students with missing emails
SELECT 
  '=== STUDENTS WITH MISSING EMAILS ===' as section,
  p.id,
  p.email,
  p.full_name,
  p.block,
  p.user_type,
  p.created_at
FROM public.profiles p
WHERE p.user_type = 'student' 
  AND (p.email IS NULL OR p.email = '')
ORDER BY p.created_at DESC;

-- 2. Check auth users without profiles
SELECT 
  '=== AUTH USERS WITHOUT PROFILES ===' as section,
  au.id,
  au.email,
  au.email_confirmed_at,
  au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
  AND au.email LIKE '%@muj.manipal.edu'
ORDER BY au.created_at DESC;

-- 3. Check for orphaned profiles (profiles without auth users)
SELECT 
  '=== ORPHANED PROFILES ===' as section,
  p.id,
  p.email,
  p.full_name,
  p.block,
  p.user_type,
  p.created_at
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.id IS NULL
  AND p.user_type = 'student'
ORDER BY p.created_at DESC;

-- 4. Get complete student list with all details
SELECT 
  '=== COMPLETE STUDENT LIST ===' as section,
  p.id,
  p.email,
  p.full_name,
  p.student_id,
  p.block,
  p.phone,
  p.loyalty_points,
  p.loyalty_tier,
  p.total_orders,
  p.total_spent,
  p.created_at,
  au.email_confirmed_at,
  au.last_sign_in_at,
  CASE 
    WHEN au.id IS NULL THEN 'NO AUTH USER'
    WHEN p.email IS NULL OR p.email = '' THEN 'MISSING EMAIL'
    WHEN au.email_confirmed_at IS NULL THEN 'UNCONFIRMED EMAIL'
    ELSE 'OK'
  END as status
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.user_type = 'student'
ORDER BY p.created_at DESC;

-- 5. Summary
SELECT 
  '=== SUMMARY ===' as section,
  'Total Student Profiles' as metric,
  COUNT(*) as count
FROM public.profiles 
WHERE user_type = 'student'
UNION ALL
SELECT 
  'SUMMARY',
  'Students with Valid Emails',
  COUNT(*)
FROM public.profiles 
WHERE user_type = 'student' 
  AND email IS NOT NULL 
  AND email != ''
UNION ALL
SELECT 
  'SUMMARY',
  'Students with Auth Users',
  COUNT(*)
FROM public.profiles p
INNER JOIN auth.users au ON p.id = au.id
WHERE p.user_type = 'student';
