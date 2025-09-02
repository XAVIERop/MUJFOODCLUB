-- DIAGNOSE ORDER ITEMS ISSUE
-- Run this in Supabase SQL Editor

-- 1. Check recent orders
SELECT 
  id,
  order_number,
  total_amount,
  created_at,
  cafe_id,
  user_id
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Check if order_items table has any data
SELECT 
  COUNT(*) as total_order_items,
  COUNT(DISTINCT order_id) as orders_with_items
FROM order_items;

-- 3. Check recent order items (if any exist)
SELECT 
  oi.id,
  oi.order_id,
  oi.quantity,
  oi.total_price,
  mi.name as item_name,
  o.order_number
FROM order_items oi
JOIN menu_items mi ON oi.menu_item_id = mi.id
JOIN orders o ON oi.order_id = o.id
ORDER BY oi.created_at DESC
LIMIT 10;

-- 4. Check specific order (replace ORDER_ID with actual order ID from step 1)
-- SELECT 
--   oi.id,
--   oi.order_id,
--   oi.quantity,
--   oi.total_price,
--   mi.name as item_name,
--   o.order_number,
--   o.total_amount
-- FROM order_items oi
-- JOIN menu_items mi ON oi.menu_item_id = mi.id
-- JOIN orders o ON oi.order_id = o.id
-- WHERE o.id = 'ORDER_ID_HERE';

-- 5. Check RLS policies on order_items table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'order_items';

-- 6. Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'order_items'
ORDER BY ordinal_position;
