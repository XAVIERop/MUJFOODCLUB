-- Create cafe staff accounts for all cafes
-- This script creates staff accounts for all 13 cafes in the system

-- 1. Create cafe owner profiles for each cafe
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
  created_at,
  updated_at
) VALUES 
-- Chatkara
(gen_random_uuid(), 'chatkara.owner@muj.manipal.edu', 'Chatkara Owner', 'B1', '+91-9876543210', 0, 'foodie'::loyalty_tier, 'QR-CHATKARA-OWNER', 'CHAT001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Taste of India
(gen_random_uuid(), 'tasteofindia.owner@muj.manipal.edu', 'Taste of India Owner', 'G1', '+91-9876543211', 0, 'foodie'::loyalty_tier, 'QR-TOI-OWNER', 'TOI001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Italian Oven
(gen_random_uuid(), 'italianoven.owner@muj.manipal.edu', 'Italian Oven Owner', 'G1', '+91-9876543212', 0, 'foodie'::loyalty_tier, 'QR-IO-OWNER', 'IO001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Food Court
(gen_random_uuid(), 'foodcourt.owner@muj.manipal.edu', 'Food Court Owner', 'G1', '+91-9876543213', 0, 'foodie'::loyalty_tier, 'QR-FC-OWNER', 'FC001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Kitchen Curry
(gen_random_uuid(), 'kitchencurry.owner@muj.manipal.edu', 'Kitchen Curry Owner', 'G1', '+91-9876543214', 0, 'foodie'::loyalty_tier, 'QR-KC-OWNER', 'KC001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Havmor
(gen_random_uuid(), 'havmor.owner@muj.manipal.edu', 'Havmor Owner', 'G1', '+91-9876543215', 0, 'foodie'::loyalty_tier, 'QR-HAVMOR-OWNER', 'HAV001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Cook House
(gen_random_uuid(), 'cookhouse.owner@muj.manipal.edu', 'Cook House Owner', 'G1', '+91-9876543216', 0, 'foodie'::loyalty_tier, 'QR-COOK-OWNER', 'COOK001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Stardom Café & Lounge
(gen_random_uuid(), 'stardom.owner@muj.manipal.edu', 'Stardom Owner', 'G2', '+91-9876543217', 0, 'foodie'::loyalty_tier, 'QR-STARDOM-OWNER', 'STAR001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Waffle Fit N Fresh
(gen_random_uuid(), 'wafflefit.owner@muj.manipal.edu', 'Waffle Fit Owner', 'G1', '+91-9876543218', 0, 'foodie'::loyalty_tier, 'QR-WAFFLE-OWNER', 'WAF001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- The Crazy Chef
(gen_random_uuid(), 'crazychef.owner@muj.manipal.edu', 'Crazy Chef Owner', 'G1', '+91-9876543219', 0, 'foodie'::loyalty_tier, 'QR-CHEF-OWNER', 'CHEF001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Zero Degree
(gen_random_uuid(), 'zerodegree.owner@muj.manipal.edu', 'Zero Degree Owner', 'G1', '+91-9876543220', 0, 'foodie'::loyalty_tier, 'QR-ZERO-OWNER', 'ZERO001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Zaika Restaurant
(gen_random_uuid(), 'zaika.owner@muj.manipal.edu', 'Zaika Owner', 'G1', '+91-9876543221', 0, 'foodie'::loyalty_tier, 'QR-ZAIKA-OWNER', 'ZAI001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Dialog
(gen_random_uuid(), 'dialog.owner@muj.manipal.edu', 'Dialog Owner', 'G1', '+91-9876543222', 0, 'foodie'::loyalty_tier, 'QR-DIALOG-OWNER', 'DIA001', 0, 0, 'cafe_owner', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 2. Create cafe staff records linking owners to their cafes
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
JOIN public.profiles p ON (
  (c.name = 'Chatkara' AND p.email = 'chatkara.owner@muj.manipal.edu') OR
  (c.name = 'Taste of India' AND p.email = 'tasteofindia.owner@muj.manipal.edu') OR
  (c.name = 'Italian Oven' AND p.email = 'italianoven.owner@muj.manipal.edu') OR
  (c.name = 'Food Court' AND p.email = 'foodcourt.owner@muj.manipal.edu') OR
  (c.name = 'Kitchen Curry' AND p.email = 'kitchencurry.owner@muj.manipal.edu') OR
  (c.name = 'Havmor' AND p.email = 'havmor.owner@muj.manipal.edu') OR
  (c.name = 'Cook House' AND p.email = 'cookhouse.owner@muj.manipal.edu') OR
  (c.name = 'STARDOM Café & Lounge' AND p.email = 'stardom.owner@muj.manipal.edu') OR
  (c.name = 'Waffle Fit N Fresh' AND p.email = 'wafflefit.owner@muj.manipal.edu') OR
  (c.name = 'The Crazy Chef' AND p.email = 'crazychef.owner@muj.manipal.edu') OR
  (c.name = 'Zero Degree' AND p.email = 'zerodegree.owner@muj.manipal.edu') OR
  (c.name = 'Zaika Restaurant' AND p.email = 'zaika.owner@muj.manipal.edu') OR
  (c.name = 'Dialog' AND p.email = 'dialog.owner@muj.manipal.edu')
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
