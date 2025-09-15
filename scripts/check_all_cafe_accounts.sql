-- Check All Cafe Accounts
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Check all cafes in the database
SELECT 
  '=== ALL CAFES IN DATABASE ===' as section,
  id,
  name,
  type,
  location,
  phone,
  hours,
  is_active,
  created_at
FROM public.cafes 
ORDER BY name;

-- 2. Check cafe owner accounts
SELECT 
  '=== CAFE OWNER ACCOUNTS ===' as section,
  p.id,
  p.email,
  p.full_name,
  p.user_type,
  p.cafe_id,
  c.name as cafe_name,
  c.location as cafe_location,
  au.email_confirmed_at,
  au.last_sign_in_at,
  p.created_at
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.user_type = 'cafe_owner'
ORDER BY p.created_at DESC;

-- 3. Check cafe staff accounts
SELECT 
  '=== CAFE STAFF ACCOUNTS ===' as section,
  p.id,
  p.email,
  p.full_name,
  p.user_type,
  p.cafe_id,
  c.name as cafe_name,
  c.location as cafe_location,
  au.email_confirmed_at,
  au.last_sign_in_at,
  p.created_at
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.user_type = 'cafe_staff'
ORDER BY p.created_at DESC;

-- 4. Check which cafes have owners
SELECT 
  '=== CAFES WITH OWNERS ===' as section,
  c.name as cafe_name,
  c.location,
  c.is_active,
  COUNT(p.id) as owner_count,
  STRING_AGG(p.email, ', ') as owner_emails
FROM public.cafes c
LEFT JOIN public.profiles p ON c.id = p.cafe_id AND p.user_type = 'cafe_owner'
GROUP BY c.id, c.name, c.location, c.is_active
ORDER BY c.name;

-- 5. Check which cafes DON'T have owners
SELECT 
  '=== CAFES WITHOUT OWNERS ===' as section,
  c.id,
  c.name,
  c.type,
  c.location,
  c.phone,
  c.is_active,
  c.created_at
FROM public.cafes c
LEFT JOIN public.profiles p ON c.id = p.cafe_id AND p.user_type = 'cafe_owner'
WHERE p.id IS NULL
ORDER BY c.name;

-- 6. Summary counts
SELECT 
  '=== SUMMARY ===' as section,
  'Total Cafes' as metric,
  COUNT(*) as count
FROM public.cafes
UNION ALL
SELECT 
  'SUMMARY',
  'Active Cafes',
  COUNT(*)
FROM public.cafes WHERE is_active = true
UNION ALL
SELECT 
  'SUMMARY',
  'Cafe Owner Accounts',
  COUNT(*)
FROM public.profiles WHERE user_type = 'cafe_owner'
UNION ALL
SELECT 
  'SUMMARY',
  'Cafe Staff Accounts',
  COUNT(*)
FROM public.profiles WHERE user_type = 'cafe_staff'
UNION ALL
SELECT 
  'SUMMARY',
  'Cafes with Owners',
  COUNT(DISTINCT c.id)
FROM public.cafes c
INNER JOIN public.profiles p ON c.id = p.cafe_id AND p.user_type = 'cafe_owner'
UNION ALL
SELECT 
  'SUMMARY',
  'Cafes without Owners',
  COUNT(*)
FROM public.cafes c
LEFT JOIN public.profiles p ON c.id = p.cafe_id AND p.user_type = 'cafe_owner'
WHERE p.id IS NULL;
