-- Check all cafe accounts (staff accounts) in the system
-- Run this in Supabase SQL Editor to see all cafe accounts

-- 1. Check all cafe staff accounts
SELECT 
  cs.id as staff_id,
  cs.cafe_id,
  cs.user_id,
  cs.role,
  cs.is_active,
  cs.created_at,
  cs.updated_at,
  p.email,
  p.full_name,
  p.phone,
  p.user_type,
  c.name as cafe_name,
  c.location as cafe_location
FROM public.cafe_staff cs
JOIN public.profiles p ON cs.user_id = p.id
JOIN public.cafes c ON cs.cafe_id = c.id
ORDER BY c.name, cs.role DESC;

-- 2. Summary of cafe accounts by role
SELECT 
  role,
  COUNT(*) as count,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_count,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_count
FROM public.cafe_staff
GROUP BY role
ORDER BY role;

-- 3. Summary of cafe accounts by cafe
SELECT 
  c.name as cafe_name,
  COUNT(cs.id) as total_staff,
  COUNT(CASE WHEN cs.role = 'owner' THEN 1 END) as owners,
  COUNT(CASE WHEN cs.role = 'manager' THEN 1 END) as managers,
  COUNT(CASE WHEN cs.role = 'staff' THEN 1 END) as staff,
  COUNT(CASE WHEN cs.is_active = true THEN 1 END) as active_staff
FROM public.cafes c
LEFT JOIN public.cafe_staff cs ON c.id = cs.cafe_id
GROUP BY c.id, c.name
ORDER BY c.name;

-- 4. Check for cafe owners specifically
SELECT 
  'Cafe Owners' as account_type,
  p.email,
  p.full_name,
  p.phone,
  c.name as cafe_name,
  cs.is_active,
  cs.created_at
FROM public.cafe_staff cs
JOIN public.profiles p ON cs.user_id = p.id
JOIN public.cafes c ON cs.cafe_id = c.id
WHERE cs.role = 'owner'
ORDER BY c.name;

-- 5. Check for any profiles with user_type = 'cafe_owner'
SELECT 
  'Cafe Owner Profiles' as account_type,
  p.email,
  p.full_name,
  p.phone,
  p.user_type,
  p.cafe_id,
  c.name as cafe_name,
  p.created_at
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
WHERE p.user_type = 'cafe_owner'
ORDER BY p.created_at;

-- 6. Check for any missing cafe staff accounts
SELECT 
  'Cafes without staff' as status,
  c.name as cafe_name,
  c.location,
  c.is_active as cafe_active
FROM public.cafes c
LEFT JOIN public.cafe_staff cs ON c.id = cs.cafe_id
WHERE cs.id IS NULL
ORDER BY c.name;
