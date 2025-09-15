-- Check Loyalty Points of All Users
-- Run this in Supabase Dashboard → SQL Editor

-- 1. All users with their loyalty points
SELECT 
  '=== ALL USERS WITH LOYALTY POINTS ===' as section,
  p.id,
  p.email,
  p.full_name,
  p.user_type,
  p.loyalty_points,
  p.loyalty_tier,
  p.total_orders,
  p.total_spent,
  p.block,
  au.last_sign_in_at,
  p.created_at
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY p.loyalty_points DESC, p.created_at DESC;

-- 2. Points summary by user type
SELECT 
  '=== POINTS SUMMARY BY USER TYPE ===' as section,
  p.user_type,
  COUNT(*) as user_count,
  SUM(p.loyalty_points) as total_points,
  AVG(p.loyalty_points) as avg_points,
  MIN(p.loyalty_points) as min_points,
  MAX(p.loyalty_points) as max_points
FROM public.profiles p
GROUP BY p.user_type
ORDER BY total_points DESC;

-- 3. Points summary by loyalty tier
SELECT 
  '=== POINTS SUMMARY BY LOYALTY TIER ===' as section,
  p.loyalty_tier,
  COUNT(*) as user_count,
  SUM(p.loyalty_points) as total_points,
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

-- 4. Top 10 users by loyalty points
SELECT 
  '=== TOP 10 USERS BY LOYALTY POINTS ===' as section,
  ROW_NUMBER() OVER (ORDER BY p.loyalty_points DESC) as rank,
  p.email,
  p.full_name,
  p.user_type,
  p.loyalty_points,
  p.loyalty_tier,
  p.total_orders,
  p.total_spent,
  p.block,
  au.last_sign_in_at
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY p.loyalty_points DESC
LIMIT 10;

-- 5. Students with points (excluding cafe owners)
SELECT 
  '=== STUDENTS WITH LOYALTY POINTS ===' as section,
  p.email,
  p.full_name,
  p.block,
  p.loyalty_points,
  p.loyalty_tier,
  p.total_orders,
  p.total_spent,
  au.last_sign_in_at,
  p.created_at
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.user_type = 'student'
ORDER BY p.loyalty_points DESC, p.total_orders DESC;

-- 6. Users with zero points
SELECT 
  '=== USERS WITH ZERO POINTS ===' as section,
  p.email,
  p.full_name,
  p.user_type,
  p.loyalty_points,
  p.total_orders,
  p.total_spent,
  au.last_sign_in_at,
  p.created_at
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.loyalty_points = 0
ORDER BY p.created_at DESC;

-- 7. Points activity summary
SELECT 
  '=== POINTS ACTIVITY SUMMARY ===' as section,
  'Total Users' as metric,
  COUNT(*) as count
FROM public.profiles
UNION ALL
SELECT 
  'POINTS ACTIVITY SUMMARY',
  'Users with Points > 0',
  COUNT(*)
FROM public.profiles 
WHERE loyalty_points > 0
UNION ALL
SELECT 
  'POINTS ACTIVITY SUMMARY',
  'Users with Zero Points',
  COUNT(*)
FROM public.profiles 
WHERE loyalty_points = 0
UNION ALL
SELECT 
  'POINTS ACTIVITY SUMMARY',
  'Total Points Awarded',
  SUM(loyalty_points)
FROM public.profiles
UNION ALL
SELECT 
  'POINTS ACTIVITY SUMMARY',
  'Average Points per User',
  ROUND(AVG(loyalty_points), 2)
FROM public.profiles
UNION ALL
SELECT 
  'POINTS ACTIVITY SUMMARY',
  'Students with Orders',
  COUNT(*)
FROM public.profiles 
WHERE user_type = 'student' AND total_orders > 0;
