-- Debug Maahi's Points Issue
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Find Maahi's user details
SELECT 
  '=== MAHI USER DETAILS ===' as section,
  p.id,
  p.email,
  p.full_name,
  p.loyalty_points,
  p.loyalty_tier,
  p.total_orders,
  p.total_spent,
  p.new_user_orders_count,
  p.is_new_user,
  p.first_order_date,
  p.created_at
FROM public.profiles p
WHERE p.email LIKE '%maahi%' OR p.full_name LIKE '%maahi%'
ORDER BY p.created_at DESC;

-- 2. Check Maahi's orders
SELECT 
  '=== MAHI ORDERS ===' as section,
  o.id,
  o.order_number,
  o.cafe_id,
  c.name as cafe_name,
  o.status,
  o.total_amount,
  o.points_earned,
  o.points_credited,
  o.created_at,
  o.completed_at
FROM public.orders o
LEFT JOIN public.cafes c ON o.cafe_id = c.id
LEFT JOIN public.profiles p ON o.user_id = p.id
WHERE p.email LIKE '%maahi%' OR p.full_name LIKE '%maahi%'
ORDER BY o.created_at DESC;

-- 3. Check Maahi's loyalty transactions
SELECT 
  '=== MAHI LOYALTY TRANSACTIONS ===' as section,
  lt.id,
  lt.order_id,
  lt.points_change,
  lt.transaction_type,
  lt.description,
  lt.created_at
FROM public.loyalty_transactions lt
LEFT JOIN public.profiles p ON lt.user_id = p.id
WHERE p.email LIKE '%maahi%' OR p.full_name LIKE '%maahi%'
ORDER BY lt.created_at DESC;

-- 4. Check if there are multiple users with similar names
SELECT 
  '=== ALL USERS WITH MAHI/MAHI IN NAME ===' as section,
  p.id,
  p.email,
  p.full_name,
  p.loyalty_points,
  p.total_orders,
  p.total_spent,
  p.created_at
FROM public.profiles p
WHERE p.email ILIKE '%maahi%' OR p.full_name ILIKE '%maahi%' OR p.email ILIKE '%maaahi%'
ORDER BY p.created_at DESC;

-- 5. Check order items for Maahi's orders
SELECT 
  '=== MAHI ORDER ITEMS ===' as section,
  oi.id,
  oi.order_id,
  oi.menu_item_id,
  mi.name as item_name,
  oi.quantity,
  oi.price,
  oi.total_price,
  oi.created_at
FROM public.order_items oi
LEFT JOIN public.menu_items mi ON oi.menu_item_id = mi.id
LEFT JOIN public.orders o ON oi.order_id = o.id
LEFT JOIN public.profiles p ON o.user_id = p.id
WHERE p.email LIKE '%maahi%' OR p.full_name LIKE '%maahi%'
ORDER BY oi.created_at DESC;

-- 6. Calculate what points should have been awarded
SELECT 
  '=== POINTS CALCULATION DEBUG ===' as section,
  'Order Amount' as metric,
  o.total_amount as value
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.id
WHERE (p.email LIKE '%maahi%' OR p.full_name LIKE '%maahi%')
  AND o.status = 'completed'
LIMIT 1

UNION ALL

SELECT 
  'POINTS CALCULATION DEBUG',
  'Expected Base Points (10 per ₹100)',
  FLOOR((o.total_amount / 100) * 10)
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.id
WHERE (p.email LIKE '%maahi%' OR p.full_name LIKE '%maahi%')
  AND o.status = 'completed'
LIMIT 1

UNION ALL

SELECT 
  'POINTS CALCULATION DEBUG',
  'First Order Bonus',
  50

UNION ALL

SELECT 
  'POINTS CALCULATION DEBUG',
  'Expected Total Points',
  FLOOR((o.total_amount / 100) * 10) + 50
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.id
WHERE (p.email LIKE '%maahi%' OR p.full_name LIKE '%maahi%')
  AND o.status = 'completed'
LIMIT 1;
