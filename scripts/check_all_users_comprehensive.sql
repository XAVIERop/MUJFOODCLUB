-- Comprehensive User Account Analysis
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Check all users in auth.users table
SELECT 
  '=== AUTH USERS ===' as section,
  'Total auth users:' as info,
  COUNT(*) as count
FROM auth.users;

SELECT 
  'Auth users details:' as info,
  id,
  email,
  email_confirmed_at,
  phone_confirmed_at,
  created_at,
  updated_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC;

-- 2. Check all profiles in public.profiles table
SELECT 
  '=== PROFILES ===' as section,
  'Total profiles:' as info,
  COUNT(*) as count
FROM public.profiles;

SELECT 
  'Profile details:' as info,
  id,
  email,
  full_name,
  student_id,
  user_type,
  cafe_id,
  block,
  phone,
  loyalty_points,
  loyalty_tier,
  total_orders,
  total_spent,
  created_at,
  updated_at
FROM public.profiles 
ORDER BY created_at DESC;

-- 3. Check user types breakdown
SELECT 
  '=== USER TYPES BREAKDOWN ===' as section,
  user_type,
  COUNT(*) as count
FROM public.profiles 
GROUP BY user_type
ORDER BY count DESC;

-- 4. Check students vs cafe accounts
SELECT 
  '=== STUDENTS VS CAFE ACCOUNTS ===' as section,
  CASE 
    WHEN user_type = 'student' THEN 'Students'
    WHEN user_type = 'cafe_owner' THEN 'Cafe Owners'
    WHEN user_type = 'cafe_staff' THEN 'Cafe Staff'
    ELSE 'Other'
  END as account_type,
  COUNT(*) as count
FROM public.profiles 
GROUP BY user_type
ORDER BY count DESC;

-- 5. Check for orphaned auth users (auth users without profiles)
SELECT 
  '=== ORPHANED AUTH USERS ===' as section,
  'Auth users without profiles:' as info,
  COUNT(*) as count
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 6. Check for orphaned profiles (profiles without auth users)
SELECT 
  '=== ORPHANED PROFILES ===' as section,
  'Profiles without auth users:' as info,
  COUNT(*) as count
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.id IS NULL;

-- 7. Check email confirmation status
SELECT 
  '=== EMAIL CONFIRMATION STATUS ===' as section,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed'
    ELSE 'Unconfirmed'
  END as status,
  COUNT(*) as count
FROM auth.users
GROUP BY 
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed'
    ELSE 'Unconfirmed'
  END;

-- 8. Check recent signups (last 7 days)
SELECT 
  '=== RECENT SIGNUPS (Last 7 days) ===' as section,
  COUNT(*) as count
FROM auth.users 
WHERE created_at >= NOW() - INTERVAL '7 days';

-- 9. Check cafe owner accounts specifically
SELECT 
  '=== CAFE OWNER ACCOUNTS ===' as section,
  p.id,
  p.email,
  p.full_name,
  p.user_type,
  p.cafe_id,
  c.name as cafe_name,
  au.email_confirmed_at,
  au.last_sign_in_at
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.user_type IN ('cafe_owner', 'cafe_staff')
ORDER BY p.created_at DESC;

-- 10. Check student accounts specifically
SELECT 
  '=== STUDENT ACCOUNTS ===' as section,
  p.id,
  p.email,
  p.full_name,
  p.block,
  p.loyalty_points,
  p.loyalty_tier,
  p.total_orders,
  au.email_confirmed_at,
  au.last_sign_in_at
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.user_type = 'student'
ORDER BY p.created_at DESC
LIMIT 20;

-- 11. Check for duplicate emails
SELECT 
  '=== DUPLICATE EMAILS ===' as section,
  email,
  COUNT(*) as count
FROM public.profiles 
GROUP BY email 
HAVING COUNT(*) > 1;

-- 12. Check authentication issues
SELECT 
  '=== AUTHENTICATION ISSUES ===' as section,
  'Users with unconfirmed emails:' as issue,
  COUNT(*) as count
FROM auth.users 
WHERE email_confirmed_at IS NULL;

-- 13. Check for users who haven't signed in recently
SELECT 
  '=== INACTIVE USERS ===' as section,
  'Users who never signed in:' as issue,
  COUNT(*) as count
FROM auth.users 
WHERE last_sign_in_at IS NULL;

-- 14. Summary
SELECT 
  '=== SUMMARY ===' as section,
  'Total Auth Users' as metric,
  (SELECT COUNT(*) FROM auth.users) as count
UNION ALL
SELECT 
  'SUMMARY',
  'Total Profiles',
  (SELECT COUNT(*) FROM public.profiles)
UNION ALL
SELECT 
  'SUMMARY',
  'Student Accounts',
  (SELECT COUNT(*) FROM public.profiles WHERE user_type = 'student')
UNION ALL
SELECT 
  'SUMMARY',
  'Cafe Owner Accounts',
  (SELECT COUNT(*) FROM public.profiles WHERE user_type = 'cafe_owner')
UNION ALL
SELECT 
  'SUMMARY',
  'Cafe Staff Accounts',
  (SELECT COUNT(*) FROM public.profiles WHERE user_type = 'cafe_staff')
UNION ALL
SELECT 
  'SUMMARY',
  'Confirmed Emails',
  (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL)
UNION ALL
SELECT 
  'SUMMARY',
  'Unconfirmed Emails',
  (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NULL);
