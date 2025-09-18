-- Quick check: Do orders have order_items?
-- Run this in Supabase SQL Editor

-- 1. Check recent orders and their item counts
SELECT 
    o.id,
    o.order_number,
    o.total_amount,
    o.cafe_id,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, o.order_number, o.total_amount, o.cafe_id
ORDER BY o.created_at DESC
LIMIT 10;

-- 2. Check if there are ANY order_items at all
SELECT 
    'Total order_items' as description,
    COUNT(*) as count
FROM order_items;

-- 3. Check if there are ANY menu_items at all
SELECT 
    'Total menu_items' as description,
    COUNT(*) as count
FROM menu_items;

-- 4. Check recent order_items (if any exist)
SELECT 
    oi.id,
    oi.order_id,
    oi.quantity,
    oi.total_price,
    o.order_number,
    o.total_amount
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
ORDER BY oi.created_at DESC
LIMIT 5;
