-- Create individual cafe owner accounts with unique credentials
-- This script creates proper authentication setup for each cafe

-- 1. First, let's see what we have currently
SELECT 'Current cafe staff setup:' as status;
SELECT 
  cs.id as staff_id,
  cs.role,
  p.email,
  p.full_name,
  c.name as cafe_name
FROM public.cafe_staff cs
JOIN public.profiles p ON cs.user_id = p.id
JOIN public.cafes c ON cs.cafe_id = c.id
ORDER BY c.name;

-- 2. Create auth.users entries for each cafe owner
-- Note: This needs to be done through Supabase Auth API, not SQL
-- But we'll prepare the profile data for each cafe

-- 3. Delete existing cafe staff records
DELETE FROM public.cafe_staff;

-- 4. Create unique cafe owner profiles for each cafe
INSERT INTO public.profiles (
  id,
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
-- CHATKARA
(gen_random_uuid(), 'chatkara.owner@mujfoodclub.in', 'Chatkara Cafe Owner', 'B1', '+91-9876543210', 'QR-CHATKARA-OWNER', 'CHAT001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- China Town
(gen_random_uuid(), 'chinatown.owner@mujfoodclub.in', 'China Town Owner', 'G1', '+91-9876543211', 'QR-CHINATOWN-OWNER', 'CT001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- COOK HOUSE
(gen_random_uuid(), 'cookhouse.owner@mujfoodclub.in', 'Cook House Owner', 'G1', '+91-9876543212', 'QR-COOKHOUSE-OWNER', 'COOK001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Dev Sweets & Snacks
(gen_random_uuid(), 'devsweets.owner@mujfoodclub.in', 'Dev Sweets Owner', 'G1', '+91-9876543213', 'QR-DEVSWEETS-OWNER', 'DEV001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Dialog
(gen_random_uuid(), 'dialog.owner@mujfoodclub.in', 'Dialog Owner', 'G1', '+91-9876543214', 'QR-DIALOG-OWNER', 'DIA001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- FOOD COURT
(gen_random_uuid(), 'foodcourt.owner@mujfoodclub.in', 'Food Court Owner', 'G1', '+91-9876543215', 'QR-FOODCOURT-OWNER', 'FC001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Havmor
(gen_random_uuid(), 'havmor.owner@mujfoodclub.in', 'Havmor Owner', 'G1', '+91-9876543216', 'QR-HAVMOR-OWNER', 'HAV001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- ITALIAN OVEN
(gen_random_uuid(), 'italianoven.owner@mujfoodclub.in', 'Italian Oven Owner', 'G1', '+91-9876543217', 'QR-ITALIANOVEN-OWNER', 'IO001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Let's Go Live
(gen_random_uuid(), 'letsgolive.owner@mujfoodclub.in', 'Lets Go Live Owner', 'G1', '+91-9876543218', 'QR-LETSGOLIVE-OWNER', 'LGL001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Mini Meals
(gen_random_uuid(), 'minimeals.owner@mujfoodclub.in', 'Mini Meals Owner', 'B1', '+91-9876543219', 'QR-MINIMEALS-OWNER', 'MM001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Munch Box
(gen_random_uuid(), 'munchbox.owner@mujfoodclub.in', 'Munch Box Owner', 'G1', '+91-9876543220', 'QR-MUNCHBOX-OWNER', 'MB001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Punjabi Tadka
(gen_random_uuid(), 'punjabitadka.owner@mujfoodclub.in', 'Punjabi Tadka Owner', 'G1', '+91-9876543221', 'QR-PUNJABITADKA-OWNER', 'PT001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Soya Chaap Corner
(gen_random_uuid(), 'soyachaap.owner@mujfoodclub.in', 'Soya Chaap Owner', 'G1', '+91-9876543222', 'QR-SOYACHAAP-OWNER', 'SC001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- STARDOM Café & Lounge
(gen_random_uuid(), 'stardom.owner@mujfoodclub.in', 'Stardom Owner', 'G2', '+91-9876543223', 'QR-STARDOM-OWNER', 'STAR001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Taste of India
(gen_random_uuid(), 'tasteofindia.owner@mujfoodclub.in', 'Taste of India Owner', 'G1', '+91-9876543224', 'QR-TASTEOFINDIA-OWNER', 'TOI001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Tea Tradition
(gen_random_uuid(), 'teatradition.owner@mujfoodclub.in', 'Tea Tradition Owner', 'G1', '+91-9876543225', 'QR-TEATRADITION-OWNER', 'TT001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- The Crazy Chef
(gen_random_uuid(), 'crazychef.owner@mujfoodclub.in', 'Crazy Chef Owner', 'G1', '+91-9876543226', 'QR-CRAZYCHEF-OWNER', 'CHEF001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- The Kitchen & Curry
(gen_random_uuid(), 'kitchencurry.owner@mujfoodclub.in', 'Kitchen Curry Owner', 'G1', '+91-9876543227', 'QR-KITCHENCURRY-OWNER', 'KC001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- Waffle Fit N Fresh
(gen_random_uuid(), 'wafflefit.owner@mujfoodclub.in', 'Waffle Fit Owner', 'G1', '+91-9876543228', 'QR-WAFFLEFIT-OWNER', 'WF001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- ZAIKA
(gen_random_uuid(), 'zaika.owner@mujfoodclub.in', 'Zaika Owner', 'G1', '+91-9876543229', 'QR-ZAIKA-OWNER', 'ZAI001', 0, 0, 'cafe_owner', NOW(), NOW()),
-- ZERO DEGREE CAFE
(gen_random_uuid(), 'zerodegree.owner@mujfoodclub.in', 'Zero Degree Owner', 'G1', '+91-9876543230', 'QR-ZERODEGREE-OWNER', 'ZD001', 0, 0, 'cafe_owner', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
  user_type = 'cafe_owner',
  updated_at = NOW();

-- 5. Create cafe staff records linking each cafe to its unique owner
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
  (c.name = 'CHATKARA' AND p.email = 'chatkara.owner@mujfoodclub.in') OR
  (c.name = 'China Town' AND p.email = 'chinatown.owner@mujfoodclub.in') OR
  (c.name = 'COOK HOUSE' AND p.email = 'cookhouse.owner@mujfoodclub.in') OR
  (c.name = 'Dev Sweets & Snacks' AND p.email = 'devsweets.owner@mujfoodclub.in') OR
  (c.name = 'Dialog' AND p.email = 'dialog.owner@mujfoodclub.in') OR
  (c.name = 'FOOD COURT' AND p.email = 'foodcourt.owner@mujfoodclub.in') OR
  (c.name = 'Havmor' AND p.email = 'havmor.owner@mujfoodclub.in') OR
  (c.name = 'ITALIAN OVEN' AND p.email = 'italianoven.owner@mujfoodclub.in') OR
  (c.name = 'Let''s Go Live' AND p.email = 'letsgolive.owner@mujfoodclub.in') OR
  (c.name = 'Mini Meals' AND p.email = 'minimeals.owner@mujfoodclub.in') OR
  (c.name = 'Munch Box' AND p.email = 'munchbox.owner@mujfoodclub.in') OR
  (c.name = 'Punjabi Tadka' AND p.email = 'punjabitadka.owner@mujfoodclub.in') OR
  (c.name = 'Soya Chaap Corner' AND p.email = 'soyachaap.owner@mujfoodclub.in') OR
  (c.name = 'STARDOM Café & Lounge' AND p.email = 'stardom.owner@mujfoodclub.in') OR
  (c.name = 'Taste of India' AND p.email = 'tasteofindia.owner@mujfoodclub.in') OR
  (c.name = 'Tea Tradition' AND p.email = 'teatradition.owner@mujfoodclub.in') OR
  (c.name = 'The Crazy Chef' AND p.email = 'crazychef.owner@mujfoodclub.in') OR
  (c.name = 'The Kitchen & Curry' AND p.email = 'kitchencurry.owner@mujfoodclub.in') OR
  (c.name = 'Waffle Fit N Fresh' AND p.email = 'wafflefit.owner@mujfoodclub.in') OR
  (c.name = 'ZAIKA' AND p.email = 'zaika.owner@mujfoodclub.in') OR
  (c.name = 'ZERO DEGREE CAFE' AND p.email = 'zerodegree.owner@mujfoodclub.in')
)
ON CONFLICT (cafe_id, user_id) DO UPDATE SET
  role = 'owner',
  is_active = true,
  updated_at = NOW();

-- 6. Verify the new setup
SELECT 'New cafe staff setup with unique emails:' as status;
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

-- 7. Summary
SELECT 'Summary:' as status;
SELECT 
  COUNT(*) as total_staff_accounts,
  COUNT(CASE WHEN role = 'owner' THEN 1 END) as owners,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_accounts
FROM public.cafe_staff;
