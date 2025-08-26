-- Check recent orders and their status
-- Run this in Supabase SQL Editor to see all orders

-- 1. Check all recent orders with details
SELECT 
  o.order_number,
  o.status,
  o.total_amount,
  o.created_at,
  o.queue_position,
  o.estimated_completion_time,
  p.full_name as customer_name,
  p.block as delivery_block,
  c.name as cafe_name
FROM public.orders o
JOIN public.profiles p ON o.user_id = p.id
JOIN public.cafes c ON o.cafe_id = c.id
ORDER BY o.created_at DESC
LIMIT 10;

-- 2. Check order queue status
SELECT 
  oq.queue_position,
  oq.status as queue_status,
  o.order_number,
  o.status as order_status,
  p.full_name as customer_name,
  o.total_amount,
  o.created_at
FROM public.order_queue oq
JOIN public.orders o ON oq.order_id = o.id
JOIN public.profiles p ON o.user_id = p.id
ORDER BY oq.queue_position;

-- 3. Check recent notifications
SELECT 
  notification_type,
  message,
  created_at,
  is_read
FROM public.order_notifications
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check cafe dashboard analytics
SELECT * FROM public.cafe_dashboard_view;
