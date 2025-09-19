-- COMPREHENSIVE ORDERS DATABASE DIAGNOSIS
-- This script will help us understand what's in your database

-- 1. CHECK IF THERE ARE ANY ORDERS AT ALL
SELECT 'Total orders in database:' as status;
SELECT COUNT(*) as total_orders FROM public.orders;

-- 2. CHECK RECENT ORDERS
SELECT 'Recent orders:' as status;
SELECT 
  id,
  order_number,
  status,
  total_amount,
  created_at,
  user_id,
  cafe_id
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. CHECK IF THERE ARE ANY ORDER ITEMS
SELECT 'Total order items in database:' as status;
SELECT COUNT(*) as total_order_items FROM public.order_items;

-- 4. CHECK RECENT ORDER ITEMS
SELECT 'Recent order items:' as status;
SELECT 
  oi.id,
  oi.order_id,
  oi.quantity,
  oi.total_price,
  mi.name as menu_item_name,
  o.order_number
FROM public.order_items oi
JOIN public.menu_items mi ON oi.menu_item_id = mi.id
JOIN public.orders o ON oi.order_id = o.id
ORDER BY o.created_at DESC
LIMIT 5;

-- 5. CHECK USERS IN THE SYSTEM
SELECT 'Users in the system:' as status;
SELECT 
  id,
  email,
  created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. CHECK PROFILES
SELECT 'Profiles in the system:' as status;
SELECT 
  id,
  email,
  full_name,
  user_type,
  created_at
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 7. CHECK CAFES
SELECT 'Cafes in the system:' as status;
SELECT 
  id,
  name,
  location,
  is_active
FROM public.cafes 
ORDER BY name
LIMIT 5;

-- 8. CHECK IF THERE ARE ORDERS FOR MUJ EMAILS
SELECT 'Orders for MUJ emails:' as status;
SELECT 
  o.id,
  o.order_number,
  o.status,
  o.total_amount,
  o.created_at,
  p.email,
  c.name as cafe_name
FROM public.orders o
JOIN public.profiles p ON o.user_id = p.id
LEFT JOIN public.cafes c ON o.cafe_id = c.id
WHERE p.email LIKE '%@muj.manipal.edu'
ORDER BY o.created_at DESC 
LIMIT 5;

-- 9. CHECK ORDER ITEMS FOR MUJ EMAILS
SELECT 'Order items for MUJ emails:' as status;
SELECT 
  oi.id,
  oi.order_id,
  oi.quantity,
  oi.total_price,
  mi.name as menu_item_name,
  o.order_number,
  p.email
FROM public.order_items oi
JOIN public.menu_items mi ON oi.menu_item_id = mi.id
JOIN public.orders o ON oi.order_id = o.id
JOIN public.profiles p ON o.user_id = p.id
WHERE p.email LIKE '%@muj.manipal.edu'
ORDER BY o.created_at DESC
LIMIT 5;

-- 10. CHECK RLS STATUS
SELECT 'RLS status:' as status;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('orders', 'order_items', 'menu_items', 'profiles')
ORDER BY tablename;

-- 11. CHECK EXISTING POLICIES
SELECT 'Existing policies:' as status;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items', 'menu_items', 'profiles')
ORDER BY tablename, policyname;

-- 12. SUCCESS MESSAGE
DO $$
BEGIN
    RAISE NOTICE 'Database diagnosis completed!';
    RAISE NOTICE 'Check the results above to understand your data structure';
    RAISE NOTICE 'This will help us identify why order items are not showing';
END $$;
