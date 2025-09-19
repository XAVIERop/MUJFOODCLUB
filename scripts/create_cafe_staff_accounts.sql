-- Create cafe staff accounts for all cafes
-- This script creates staff accounts for all 13 cafes in the system

-- NOTE: This script only creates the database records. 
-- You need to manually create auth users in Supabase Auth dashboard for each email.

-- 1. Create cafe owner profiles for each cafe
-- These will be created automatically when auth users are created due to the trigger
-- But we can also create them manually if needed

-- First, let's create the profiles without specifying IDs (let the trigger handle it)
INSERT INTO public.profiles (
  email,
  full_name,
  block,
  phone,
  qr_code,
  student_id,
  total_orders,
  total_spent,
  user_type,
  created_at,
  updated_at
) VALUES 
-- Chatkara
('chatkara.owner@muj.manipal.edu', 'Chatkara Owner', 'B1', '+91-9876543210', 'QR-CHATKARA-OWNER', 'CHAT001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Taste of India
('tasteofindia.owner@muj.manipal.edu', 'Taste of India Owner', 'G1', '+91-9876543211', 'QR-TOI-OWNER', 'TOI001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Italian Oven
('italianoven.owner@muj.manipal.edu', 'Italian Oven Owner', 'G1', '+91-9876543212', 'QR-IO-OWNER', 'IO001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Food Court
('foodcourt.owner@muj.manipal.edu', 'Food Court Owner', 'G1', '+91-9876543213', 'QR-FC-OWNER', 'FC001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Kitchen Curry
('kitchencurry.owner@muj.manipal.edu', 'Kitchen Curry Owner', 'G1', '+91-9876543214', 'QR-KC-OWNER', 'KC001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Havmor
('havmor.owner@muj.manipal.edu', 'Havmor Owner', 'G1', '+91-9876543215', 'QR-HAVMOR-OWNER', 'HAV001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Cook House
('cookhouse.owner@muj.manipal.edu', 'Cook House Owner', 'G1', '+91-9876543216', 'QR-COOK-OWNER', 'COOK001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Stardom Café & Lounge
('stardom.owner@muj.manipal.edu', 'Stardom Owner', 'G2', '+91-9876543217', 'QR-STARDOM-OWNER', 'STAR001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Waffle Fit N Fresh
('wafflefit.owner@muj.manipal.edu', 'Waffle Fit Owner', 'G1', '+91-9876543218', 'QR-WAFFLE-OWNER', 'WAF001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- The Crazy Chef
('crazychef.owner@muj.manipal.edu', 'Crazy Chef Owner', 'G1', '+91-9876543219', 'QR-CHEF-OWNER', 'CHEF001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Zero Degree
('zerodegree.owner@muj.manipal.edu', 'Zero Degree Owner', 'G1', '+91-9876543220', 'QR-ZERO-OWNER', 'ZERO001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Zaika Restaurant
('zaika.owner@muj.manipal.edu', 'Zaika Owner', 'G1', '+91-9876543221', 'QR-ZAIKA-OWNER', 'ZAI001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Dialog
('dialog.owner@muj.manipal.edu', 'Dialog Owner', 'G1', '+91-9876543222', 'QR-DIALOG-OWNER', 'DIA001', 0, 0, 'cafe_owner', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
  user_type = 'cafe_owner',
  updated_at = NOW();

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
