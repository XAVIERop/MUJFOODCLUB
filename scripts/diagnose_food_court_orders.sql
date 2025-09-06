-- Diagnose Food Court order issues
-- This script helps identify why orders aren't appearing in Food Court dashboard

-- 1. Check Food Court cafe configuration
SELECT 'Food Court cafe configuration:' as status;
SELECT 
  id,
  name,
  accepting_orders,
  is_active,
  created_at
FROM public.cafes 
WHERE name = 'FOOD COURT';

-- 2. Check Food Court owner profile
SELECT 'Food Court owner profile:' as status;
SELECT 
  id,
  email,
  full_name,
  user_type,
  cafe_id,
  created_at
FROM public.profiles 
WHERE email = 'foodcourt.owner@mujfoodclub.in';

-- 3. Check Food Court staff assignments
SELECT 'Food Court staff assignments:' as status;
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

-- 4. Check recent orders for Food Court
SELECT 'Recent Food Court orders (last 10):' as status;
SELECT 
  o.id,
  o.order_number,
  o.status,
  o.total_amount,
  o.cafe_id,
  o.created_at,
  c.name as cafe_name
FROM public.orders o
JOIN public.cafes c ON o.cafe_id = c.id
WHERE c.name = 'FOOD COURT'
ORDER BY o.created_at DESC
LIMIT 10;

-- 5. Check all recent orders (to see if any are being created)
SELECT 'All recent orders (last 10):' as status;
SELECT 
  o.id,
  o.order_number,
  o.status,
  o.total_amount,
  o.cafe_id,
  o.created_at,
  c.name as cafe_name
FROM public.orders o
JOIN public.cafes c ON o.cafe_id = c.id
ORDER BY o.created_at DESC
LIMIT 10;

-- 6. Check Food Court menu items
SELECT 'Food Court menu items count:' as status;
SELECT 
  c.name as cafe_name,
  COUNT(mi.id) as menu_items_count
FROM public.cafes c
LEFT JOIN public.menu_items mi ON c.id = mi.cafe_id
WHERE c.name = 'FOOD COURT'
GROUP BY c.id, c.name;

-- 7. Check if there are any RLS policy issues
SELECT 'Checking RLS policies on orders table:' as status;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'orders';

-- 8. Test query that POS Dashboard would use
SELECT 'Testing POS Dashboard query:' as status;
SELECT 
  o.id,
  o.order_number,
  o.status,
  o.total_amount,
  o.created_at
FROM public.orders o
WHERE o.cafe_id = (SELECT id FROM public.cafes WHERE name = 'FOOD COURT')
ORDER BY o.created_at DESC
LIMIT 5;
