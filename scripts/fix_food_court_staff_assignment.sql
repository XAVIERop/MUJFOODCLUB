-- Fix Food Court staff assignment for POS Dashboard
-- This script assigns proper staff to Food Court so POS Dashboard can receive orders

-- 1. First, let's check the current Food Court setup
SELECT 'Current Food Court setup:' as status;
SELECT 
  c.id as cafe_id,
  c.name as cafe_name,
  c.accepting_orders,
  c.is_active
FROM public.cafes c
WHERE c.name = 'FOOD COURT';

-- 2. Check if there are any existing staff for Food Court
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

-- 3. Create a Food Court owner profile if it doesn't exist
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  block,
  phone,
  loyalty_points,
  loyalty_tier,
  qr_code,
  student_id,
  total_orders,
  total_spent,
  user_type,
  cafe_id,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'food.court.owner@muj.manipal.edu',
  'Food Court Manager',
  'B1',
  '+91-9876543210',
  0,
  'foodie'::loyalty_tier,
  'QR-FOOD-COURT-OWNER',
  'FC001',
  0,
  0,
  'cafe_owner',
  (SELECT id FROM public.cafes WHERE name = 'FOOD COURT'),
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  user_type = 'cafe_owner',
  cafe_id = (SELECT id FROM public.cafes WHERE name = 'FOOD COURT'),
  updated_at = NOW();

-- 4. Assign the Food Court owner to cafe_staff table
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
JOIN public.profiles p ON p.email = 'food.court.owner@muj.manipal.edu'
WHERE c.name = 'FOOD COURT'
ON CONFLICT (cafe_id, user_id) DO UPDATE SET
  role = 'owner',
  is_active = true,
  updated_at = NOW();

-- 5. Also assign Pulkit as staff for Food Court (if he exists)
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
  'staff' as role,
  true as is_active,
  NOW(),
  NOW()
FROM public.cafes c
CROSS JOIN public.profiles p
WHERE p.email = 'pulkit.229302047@muj.manipal.edu'
  AND c.name = 'FOOD COURT'
ON CONFLICT (cafe_id, user_id) DO UPDATE SET
  role = 'staff',
  is_active = true,
  updated_at = NOW();

-- 6. Verify the Food Court staff setup
SELECT 'Updated Food Court staff:' as status;
SELECT 
  cs.id,
  cs.cafe_id,
  cs.user_id,
  cs.role,
  cs.is_active,
  p.email,
  p.full_name,
  p.user_type,
  c.name as cafe_name
FROM public.cafe_staff cs
JOIN public.profiles p ON cs.user_id = p.id
JOIN public.cafes c ON cs.cafe_id = c.id
WHERE c.name = 'FOOD COURT'
ORDER BY cs.role DESC;

-- 7. Check if Food Court is accepting orders
UPDATE public.cafes 
SET accepting_orders = true, is_active = true
WHERE name = 'FOOD COURT';

-- 8. Verify Food Court is properly configured
SELECT 'Final Food Court configuration:' as status;
SELECT 
  c.id as cafe_id,
  c.name as cafe_name,
  c.accepting_orders,
  c.is_active,
  COUNT(cs.id) as staff_count
FROM public.cafes c
LEFT JOIN public.cafe_staff cs ON c.id = cs.cafe_id AND cs.is_active = true
WHERE c.name = 'FOOD COURT'
GROUP BY c.id, c.name, c.accepting_orders, c.is_active;

-- 9. Test query to check if orders can be fetched for Food Court
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
