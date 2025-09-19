-- Assign existing cafe owner to all cafes
-- This script uses the existing Chatkara owner profile for all cafes

-- 1. Get the existing cafe owner profile
SELECT 'Using existing cafe owner:' as status;
SELECT id, email, full_name, user_type FROM public.profiles WHERE user_type = 'cafe_owner';

-- 2. Create cafe staff records for all cafes using the existing owner
INSERT INTO public.cafe_staff (
  id,
  cafe_id,
  user_id,
  role,
  is_active,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  c.id as cafe_id,
  p.id as user_id,
  'owner' as role,
  true as is_active,
  NOW() as created_at,
  NOW() as updated_at
FROM public.cafes c
CROSS JOIN public.profiles p
WHERE p.user_type = 'cafe_owner'
  AND NOT EXISTS (
    SELECT 1 FROM public.cafe_staff cs 
    WHERE cs.cafe_id = c.id AND cs.user_id = p.id
  )
ON CONFLICT (cafe_id, user_id) DO UPDATE SET
  role = 'owner',
  is_active = true,
  updated_at = NOW();

-- 3. Verify the setup
SELECT 'Cafe Staff Accounts Created:' as status;
SELECT 
  cs.id as staff_id,
  cs.role,
  cs.is_active,
  p.email,
  p.full_name,
  c.name as cafe_name
FROM public.cafe_staff cs
JOIN public.profiles p ON cs.user_id = p.id
JOIN public.cafes c ON cs.cafe_id = c.id
ORDER BY c.name;

-- 4. Summary
SELECT 'Summary:' as status;
SELECT 
  COUNT(*) as total_staff_accounts,
  COUNT(CASE WHEN role = 'owner' THEN 1 END) as owners,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_accounts
FROM public.cafe_staff;
