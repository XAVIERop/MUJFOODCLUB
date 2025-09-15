-- Check All Student Accounts
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Check all student accounts
SELECT 
  '=== ALL STUDENT ACCOUNTS ===' as section,
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
  au.last_sign_in_at
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.user_type = 'student'
ORDER BY p.created_at DESC;

-- 2. Student accounts by block
SELECT 
  '=== STUDENTS BY BLOCK ===' as section,
  block,
  COUNT(*) as student_count
FROM public.profiles 
WHERE user_type = 'student'
GROUP BY block
ORDER BY block;

-- 3. Student accounts by loyalty tier
SELECT 
  '=== STUDENTS BY LOYALTY TIER ===' as section,
  loyalty_tier,
  COUNT(*) as student_count,
  AVG(loyalty_points) as avg_points,
  AVG(total_orders) as avg_orders,
  AVG(total_spent) as avg_spent
FROM public.profiles 
WHERE user_type = 'student'
GROUP BY loyalty_tier
ORDER BY 
  CASE loyalty_tier
    WHEN 'connoisseur' THEN 3
    WHEN 'gourmet' THEN 2
    WHEN 'foodie' THEN 1
  END DESC;

-- 4. Active vs inactive students
SELECT 
  '=== STUDENT ACTIVITY STATUS ===' as section,
  CASE 
    WHEN au.last_sign_in_at IS NULL THEN 'Never Logged In'
    WHEN au.last_sign_in_at >= NOW() - INTERVAL '7 days' THEN 'Active (Last 7 days)'
    WHEN au.last_sign_in_at >= NOW() - INTERVAL '30 days' THEN 'Active (Last 30 days)'
    ELSE 'Inactive (30+ days)'
  END as activity_status,
  COUNT(*) as student_count
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.user_type = 'student'
GROUP BY 
  CASE 
    WHEN au.last_sign_in_at IS NULL THEN 'Never Logged In'
    WHEN au.last_sign_in_at >= NOW() - INTERVAL '7 days' THEN 'Active (Last 7 days)'
    WHEN au.last_sign_in_at >= NOW() - INTERVAL '30 days' THEN 'Active (Last 30 days)'
    ELSE 'Inactive (30+ days)'
  END
ORDER BY student_count DESC;

-- 5. Top students by loyalty points
SELECT 
  '=== TOP STUDENTS BY LOYALTY POINTS ===' as section,
  p.email,
  p.full_name,
  p.block,
  p.loyalty_points,
  p.loyalty_tier,
  p.total_orders,
  p.total_spent,
  au.last_sign_in_at
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.user_type = 'student'
ORDER BY p.loyalty_points DESC
LIMIT 10;

-- 6. Recent student signups
SELECT 
  '=== RECENT STUDENT SIGNUPS (Last 7 days) ===' as section,
  p.email,
  p.full_name,
  p.block,
  p.loyalty_points,
  p.created_at,
  au.email_confirmed_at,
  au.last_sign_in_at
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.user_type = 'student'
  AND p.created_at >= NOW() - INTERVAL '7 days'
ORDER BY p.created_at DESC;

-- 7. Students with unconfirmed emails
SELECT 
  '=== STUDENTS WITH UNCONFIRMED EMAILS ===' as section,
  p.email,
  p.full_name,
  p.block,
  p.created_at,
  au.email_confirmed_at
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.user_type = 'student'
  AND au.email_confirmed_at IS NULL
ORDER BY p.created_at DESC;

-- 8. Summary statistics
SELECT 
  '=== SUMMARY ===' as section,
  'Total Students' as metric,
  COUNT(*) as count
FROM public.profiles 
WHERE user_type = 'student'
UNION ALL
SELECT 
  'SUMMARY',
  'Students with Confirmed Emails',
  COUNT(*)
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.user_type = 'student' AND au.email_confirmed_at IS NOT NULL
UNION ALL
SELECT 
  'SUMMARY',
  'Students with Unconfirmed Emails',
  COUNT(*)
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.user_type = 'student' AND au.email_confirmed_at IS NULL
UNION ALL
SELECT 
  'SUMMARY',
  'Active Students (Last 7 days)',
  COUNT(*)
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.user_type = 'student' AND au.last_sign_in_at >= NOW() - INTERVAL '7 days'
UNION ALL
SELECT 
  'SUMMARY',
  'Students Never Logged In',
  COUNT(*)
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.user_type = 'student' AND au.last_sign_in_at IS NULL;
