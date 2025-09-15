-- Get Detailed Info of All 19 Student Users
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Complete student information
SELECT 
  '=== ALL 19 STUDENT USERS ===' as section,
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
  p.qr_code,
  p.created_at as profile_created,
  au.email_confirmed_at,
  au.last_sign_in_at,
  au.created_at as auth_created,
  CASE 
    WHEN au.last_sign_in_at IS NULL THEN 'Never Logged In'
    WHEN au.last_sign_in_at >= NOW() - INTERVAL '7 days' THEN 'Active (Last 7 days)'
    WHEN au.last_sign_in_at >= NOW() - INTERVAL '30 days' THEN 'Active (Last 30 days)'
    ELSE 'Inactive (30+ days)'
  END as activity_status
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.user_type = 'student'
ORDER BY p.created_at DESC;

-- 2. Summary by activity status
SELECT 
  '=== ACTIVITY BREAKDOWN ===' as section,
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

-- 3. Summary by block (if they have different blocks)
SELECT 
  '=== STUDENTS BY BLOCK ===' as section,
  COALESCE(p.block, 'Not Set') as block,
  COUNT(*) as student_count
FROM public.profiles p
WHERE p.user_type = 'student'
GROUP BY p.block
ORDER BY student_count DESC;

-- 4. Summary by loyalty tier
SELECT 
  '=== STUDENTS BY LOYALTY TIER ===' as section,
  p.loyalty_tier,
  COUNT(*) as student_count,
  AVG(p.loyalty_points) as avg_points,
  AVG(p.total_orders) as avg_orders,
  AVG(p.total_spent) as avg_spent
FROM public.profiles p
WHERE p.user_type = 'student'
GROUP BY p.loyalty_tier
ORDER BY 
  CASE p.loyalty_tier
    WHEN 'connoisseur' THEN 3
    WHEN 'gourmet' THEN 2
    WHEN 'foodie' THEN 1
  END DESC;

-- 5. Top students by activity
SELECT 
  '=== MOST ACTIVE STUDENTS ===' as section,
  p.email,
  p.full_name,
  p.block,
  p.loyalty_points,
  p.total_orders,
  p.total_spent,
  au.last_sign_in_at,
  CASE 
    WHEN au.last_sign_in_at IS NULL THEN 'Never'
    ELSE EXTRACT(DAYS FROM NOW() - au.last_sign_in_at)::INTEGER || ' days ago'
  END as last_login
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.user_type = 'student'
ORDER BY au.last_sign_in_at DESC NULLS LAST
LIMIT 10;

-- 6. Recent signups (last 7 days)
SELECT 
  '=== RECENT SIGNUPS (Last 7 days) ===' as section,
  p.email,
  p.full_name,
  p.block,
  p.created_at,
  au.email_confirmed_at,
  au.last_sign_in_at
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.user_type = 'student'
  AND p.created_at >= NOW() - INTERVAL '7 days'
ORDER BY p.created_at DESC;
