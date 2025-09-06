-- Fix Food Court owner assignment - Use correct email: foodcourt.owner@mujfoodclub.in
-- This script assigns the correct Food Court owner

-- 1. Check current Food Court setup
SELECT 'Current Food Court setup:' as status;
SELECT 
  c.id as cafe_id,
  c.name as cafe_name,
  c.accepting_orders,
  c.is_active
FROM public.cafes c
WHERE c.name = 'FOOD COURT';

-- 2. Check if the correct Food Court owner exists
SELECT 'Checking Food Court owner profile:' as status;
SELECT 
  id,
  email,
  full_name,
  user_type,
  cafe_id
FROM public.profiles 
WHERE email = 'foodcourt.owner@mujfoodclub.in';

-- 3. Check current Food Court staff
SELECT 'Current Food Court staff:' as status;
SELECT 
  cs.id,
  cs.cafe_id,
  cs.user_id,
  cs.role,
  cs.is_active,
  p.email,
  p.full_name,
  c.name as cafe_name
FROM public.cafe_staff cs
JOIN public.profiles p ON cs.user_id = p.id
JOIN public.cafes c ON cs.cafe_id = c.id
WHERE c.name = 'FOOD COURT';

-- 4. Update Food Court owner profile to correct email and cafe
UPDATE public.profiles 
SET 
  email = 'foodcourt.owner@mujfoodclub.in',
  user_type = 'cafe_owner',
  cafe_id = (SELECT id FROM public.cafes WHERE name = 'FOOD COURT'),
  updated_at = NOW()
WHERE email = 'pulkit.229302047@muj.manipal.edu';

-- 5. Update cafe_staff table to use correct email
UPDATE public.cafe_staff 
SET 
  user_id = (SELECT id FROM public.profiles WHERE email = 'foodcourt.owner@mujfoodclub.in'),
  role = 'owner',
  is_active = true,
  updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = 'FOOD COURT');

-- 6. Ensure Food Court is accepting orders
UPDATE public.cafes 
SET accepting_orders = true, is_active = true
WHERE name = 'FOOD COURT';

-- 7. Verify the final setup
SELECT 'Final Food Court owner verification:' as status;
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
WHERE p.email = 'foodcourt.owner@mujfoodclub.in';

-- 8. Check Food Court staff count
SELECT 'Food Court staff count:' as status;
SELECT 
  c.name as cafe_name,
  COUNT(cs.id) as staff_count
FROM public.cafes c
LEFT JOIN public.cafe_staff cs ON c.id = cs.cafe_id AND cs.is_active = true
WHERE c.name = 'FOOD COURT'
GROUP BY c.id, c.name;

-- 9. Test recent Food Court orders
SELECT 'Recent Food Court orders:' as status;
SELECT 
  o.id,
  o.order_number,
  o.status,
  o.total_amount,
  o.created_at,
  c.name as cafe_name
FROM public.orders o
JOIN public.cafes c ON o.cafe_id = c.id
WHERE c.name = 'FOOD COURT'
ORDER BY o.created_at DESC
LIMIT 5;

COMMIT;
