-- Check Cafe ID Conflicts
-- This script identifies the exact conflict between Punjabi Tadka and Chatkara
-- Run this FIRST to understand the current state

-- Step 1: Check all cafes and their IDs
SELECT 
  'ALL CAFES:' as section,
  id,
  name,
  type,
  location,
  is_active,
  created_at
FROM public.cafes 
ORDER BY name;

-- Step 2: Check for duplicate cafe IDs
SELECT 
  'DUPLICATE ID ANALYSIS:' as section,
  id,
  COUNT(*) as cafe_count,
  STRING_AGG(name, ' | ') as cafe_names
FROM public.cafes 
GROUP BY id
HAVING COUNT(*) > 1
ORDER BY id;

-- Step 3: Check specific cafes that might be conflicting
SELECT 
  'POTENTIAL CONFLICTS:' as section,
  id,
  name,
  type,
  location,
  is_active
FROM public.cafes 
WHERE name ILIKE '%punjabi%' 
   OR name ILIKE '%tadka%' 
   OR name ILIKE '%chatkara%'
   OR name ILIKE '%chaap%'
ORDER BY name;

-- Step 4: Check what's using the conflicting ID
SELECT 
  'USERS OF CONFLICTING ID 25d0b247-0731-4e52-a0fb-023526adfa34:' as section,
  'Profiles:' as type,
  p.email,
  p.full_name,
  p.user_type::text
FROM public.profiles p
WHERE p.cafe_id = '25d0b247-0731-4e52-a0fb-023526adfa34'

UNION ALL

SELECT 
  'USERS OF CONFLICTING ID 25d0b247-0731-4e52-a0fb-023526adfa34:' as section,
  'Cafe Staff:' as type,
  p.email,
  p.full_name,
  cs.role::text
FROM public.cafe_staff cs
JOIN public.profiles p ON cs.user_id = p.id
WHERE cs.cafe_id = '25d0b247-0731-4e52-a0fb-023526adfa34'

UNION ALL

SELECT 
  'USERS OF CONFLICTING ID 25d0b247-0731-4e52-a0fb-023526adfa34:' as section,
  'Orders:' as type,
  o.order_number,
  o.status::text,
  o.total_amount::text
FROM public.orders o
WHERE o.cafe_id = '25d0b247-0731-4e52-a0fb-023526adfa34';

-- Step 5: Check what's using the Punjabi Tadka ID
SELECT 
  'USERS OF PUNJABI TADKA ID 6097276a-f9c2-4a1e-b95d-eda66b3f6cc3:' as section,
  'Profiles:' as type,
  p.email,
  p.full_name,
  p.user_type::text
FROM public.profiles p
WHERE p.cafe_id = '6097276a-f9c2-4a1e-b95d-eda66b3f6cc3'

UNION ALL

SELECT 
  'USERS OF PUNJABI TADKA ID 6097276a-f9c2-4a1e-b95d-eda66b3f6cc3:' as section,
  'Cafe Staff:' as type,
  p.email,
  p.full_name,
  cs.role::text
FROM public.cafe_staff cs
JOIN public.profiles p ON cs.user_id = p.id
WHERE cs.cafe_id = '6097276a-f9c2-4a1e-b95d-eda66b3f6cc3'

UNION ALL

SELECT 
  'USERS OF PUNJABI TADKA ID 6097276a-f9c2-4a1e-b95d-eda66b3f6cc3:' as section,
  'Orders:' as type,
  o.order_number,
  o.status::text,
  o.total_amount::text
FROM public.orders o
WHERE o.cafe_id = '6097276a-f9c2-4a1e-b95d-eda66b3f6cc3';

-- Step 6: Check PUN000003 order specifically
SELECT 
  'PUN000003 ORDER DETAILS:' as section,
  o.id,
  o.order_number,
  o.status,
  o.total_amount,
  o.cafe_id,
  c.name as cafe_name,
  c.id as actual_cafe_id,
  o.created_at
FROM public.orders o
LEFT JOIN public.cafes c ON o.cafe_id = c.id
WHERE o.order_number = 'PUN000003';

-- Step 7: Check all PUN* orders
SELECT 
  'ALL PUN* ORDERS:' as section,
  o.order_number,
  o.status,
  o.total_amount,
  o.cafe_id,
  c.name as cafe_name,
  o.created_at
FROM public.orders o
LEFT JOIN public.cafes c ON o.cafe_id = c.id
WHERE o.order_number LIKE 'PUN%'
ORDER BY o.created_at DESC;

-- Step 8: Check all CHA* orders
SELECT 
  'ALL CHA* ORDERS:' as section,
  o.order_number,
  o.status,
  o.total_amount,
  o.cafe_id,
  c.name as cafe_name,
  o.created_at
FROM public.orders o
LEFT JOIN public.cafes c ON o.cafe_id = c.id
WHERE o.order_number LIKE 'CHA%'
ORDER BY o.created_at DESC;

-- Step 9: Summary of the conflict
SELECT 
  'CONFLICT SUMMARY:' as section,
  'If both Punjabi Tadka and Chatkara show the same cafe_id, that is the problem' as issue_1,
  'PUN000003 should be assigned to Punjabi Tadka cafe, not Chatkara' as issue_2,
  'Both cafe owners should have different cafe_ids in their profiles' as issue_3;
