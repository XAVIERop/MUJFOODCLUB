-- Simple fix for Food Court POS Dashboard - Assign existing user as Food Court owner
-- This script assigns Pulkit as Food Court owner without creating new users

-- 1. Check current Food Court setup
SELECT 'Current Food Court setup:' as status;
SELECT 
  c.id as cafe_id,
  c.name as cafe_name,
  c.accepting_orders,
  c.is_active
FROM public.cafes c
WHERE c.name = 'FOOD COURT';

-- 2. Check if Pulkit exists
SELECT 'Checking if Pulkit exists:' as status;
SELECT 
  id,
  email,
  full_name,
  user_type,
  cafe_id
FROM public.profiles 
WHERE email = 'pulkit.229302047@muj.manipal.edu';

-- 3. Update Pulkit's profile to be Food Court owner
UPDATE public.profiles 
SET 
  user_type = 'cafe_owner',
  cafe_id = (SELECT id FROM public.cafes WHERE name = 'FOOD COURT'),
  updated_at = NOW()
WHERE email = 'pulkit.229302047@muj.manipal.edu';

-- 4. Assign Pulkit as Food Court owner in cafe_staff table
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
  NOW(),
  NOW()
FROM public.cafes c
JOIN public.profiles p ON p.email = 'pulkit.229302047@muj.manipal.edu'
WHERE c.name = 'FOOD COURT'
ON CONFLICT (cafe_id, user_id) DO UPDATE SET
  role = 'owner',
  is_active = true,
  updated_at = NOW();

-- 5. Ensure Food Court is accepting orders
UPDATE public.cafes 
SET accepting_orders = true, is_active = true
WHERE name = 'FOOD COURT';

-- 6. Verify the setup
SELECT 'Final verification:' as status;
SELECT 
  p.email,
  p.full_name,
  p.user_type,
  p.cafe_id,
  c.name as cafe_name,
  cs.role as staff_role,
  cs.is_active as staff_active
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
LEFT JOIN public.cafe_staff cs ON cs.user_id = p.id AND cs.cafe_id = c.id
WHERE p.email = 'pulkit.229302047@muj.manipal.edu';

-- 7. Check Food Court staff count
SELECT 'Food Court staff count:' as status;
SELECT 
  c.name as cafe_name,
  COUNT(cs.id) as staff_count
FROM public.cafes c
LEFT JOIN public.cafe_staff cs ON c.id = cs.cafe_id AND cs.is_active = true
WHERE c.name = 'FOOD COURT'
GROUP BY c.id, c.name;

COMMIT;
