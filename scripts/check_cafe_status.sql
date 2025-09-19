-- Check current status of all cafes
-- Run this in Supabase SQL Editor to see cafe status

-- 1. Basic cafe information with status
SELECT 
  id,
  name,
  type,
  location,
  phone,
  hours,
  rating,
  total_reviews,
  is_active,
  accepting_orders,
  created_at,
  updated_at
FROM public.cafes
ORDER BY name;

-- 2. Cafe status summary
SELECT 
  COUNT(*) as total_cafes,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_cafes,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_cafes,
  COUNT(CASE WHEN accepting_orders = true THEN 1 END) as accepting_orders,
  COUNT(CASE WHEN accepting_orders = false THEN 1 END) as not_accepting_orders
FROM public.cafes;

-- 3. Recent activity (last 24 hours)
SELECT 
  c.name as cafe_name,
  c.is_active,
  c.accepting_orders,
  COUNT(o.id) as orders_last_24h,
  COALESCE(SUM(o.total_amount), 0) as revenue_last_24h
FROM public.cafes c
LEFT JOIN public.orders o ON c.id = o.cafe_id 
  AND o.created_at >= NOW() - INTERVAL '24 hours'
GROUP BY c.id, c.name, c.is_active, c.accepting_orders
ORDER BY orders_last_24h DESC;

-- 4. Menu items availability by cafe
SELECT 
  c.name as cafe_name,
  c.is_active,
  c.accepting_orders,
  COUNT(mi.id) as total_menu_items,
  COUNT(CASE WHEN mi.is_available = true AND mi.out_of_stock = false THEN 1 END) as available_items,
  COUNT(CASE WHEN mi.is_available = false THEN 1 END) as unavailable_items,
  COUNT(CASE WHEN mi.out_of_stock = true THEN 1 END) as out_of_stock_items
FROM public.cafes c
LEFT JOIN public.menu_items mi ON c.id = mi.cafe_id
GROUP BY c.id, c.name, c.is_active, c.accepting_orders
ORDER BY c.name;

-- 5. Current orders by cafe
SELECT 
  c.name as cafe_name,
  o.status,
  COUNT(o.id) as order_count,
  COALESCE(SUM(o.total_amount), 0) as total_amount
FROM public.cafes c
LEFT JOIN public.orders o ON c.id = o.cafe_id 
  AND o.status IN ('received', 'confirmed', 'preparing', 'on_the_way')
GROUP BY c.id, c.name, o.status
ORDER BY c.name, o.status;