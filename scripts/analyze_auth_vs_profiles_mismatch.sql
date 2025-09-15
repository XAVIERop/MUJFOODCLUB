-- Analyze Auth Users vs Profiles Mismatch
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Count comparison
SELECT 
  '=== COUNT COMPARISON ===' as section,
  'Auth Users' as type,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'COUNT COMPARISON',
  'Student Profiles',
  COUNT(*)
FROM public.profiles 
WHERE user_type = 'student'
UNION ALL
SELECT 
  'COUNT COMPARISON',
  'Cafe Owner Profiles',
  COUNT(*)
FROM public.profiles 
WHERE user_type = 'cafe_owner';

-- 2. Auth users without profiles (MISSING PROFILES)
SELECT 
  '=== AUTH USERS WITHOUT PROFILES ===' as section,
  au.id,
  au.email,
  au.email_confirmed_at,
  au.created_at,
  CASE 
    WHEN au.email LIKE '%owner%' THEN 'CAFE OWNER'
    WHEN au.email LIKE '%test%' THEN 'TEST ACCOUNT'
    WHEN au.email LIKE '%magic%' THEN 'MAGIC LINK TEST'
    ELSE 'STUDENT'
  END as account_type
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- 3. Profiles without auth users (ORPHANED PROFILES)
SELECT 
  '=== PROFILES WITHOUT AUTH USERS ===' as section,
  p.id,
  p.email,
  p.full_name,
  p.user_type,
  p.created_at
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.id IS NULL
ORDER BY p.created_at DESC;

-- 4. Real students vs test accounts breakdown
SELECT 
  '=== ACCOUNT TYPE BREAKDOWN ===' as section,
  CASE 
    WHEN email LIKE '%owner%' THEN 'Cafe Owners'
    WHEN email LIKE '%test%' THEN 'Test Accounts'
    WHEN email LIKE '%magic%' THEN 'Magic Link Tests'
    WHEN email LIKE '%.229%' OR email LIKE '%.242%' OR email LIKE '%.243%' THEN 'Real Students'
    ELSE 'Other'
  END as account_type,
  COUNT(*) as count
FROM auth.users
GROUP BY 
  CASE 
    WHEN email LIKE '%owner%' THEN 'Cafe Owners'
    WHEN email LIKE '%test%' THEN 'Test Accounts'
    WHEN email LIKE '%magic%' THEN 'Magic Link Tests'
    WHEN email LIKE '%.229%' OR email LIKE '%.242%' OR email LIKE '%.243%' THEN 'Real Students'
    ELSE 'Other'
  END
ORDER BY count DESC;

-- 5. Real students who need profiles created
SELECT 
  '=== REAL STUDENTS NEEDING PROFILES ===' as section,
  au.id,
  au.email,
  au.email_confirmed_at,
  au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
  AND (au.email LIKE '%.229%' OR au.email LIKE '%.242%' OR au.email LIKE '%.243%')
ORDER BY au.created_at DESC;

-- 6. Summary of the problem
SELECT 
  '=== PROBLEM SUMMARY ===' as section,
  'Total Auth Users' as metric,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'PROBLEM SUMMARY',
  'Auth Users with Profiles',
  COUNT(*)
FROM auth.users au
INNER JOIN public.profiles p ON au.id = p.id
UNION ALL
SELECT 
  'PROBLEM SUMMARY',
  'Auth Users WITHOUT Profiles',
  COUNT(*)
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
UNION ALL
SELECT 
  'PROBLEM SUMMARY',
  'Real Students Missing Profiles',
  COUNT(*)
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
  AND (au.email LIKE '%.229%' OR au.email LIKE '%.242%' OR au.email LIKE '%.243%');
