-- Check analytics data for POS Dashboard
-- This script helps diagnose why analytics shows no data

-- 1. Check what cafes exist and their status
SELECT 
    id,
    name,
    accepting_orders,
    created_at
FROM cafes 
ORDER BY created_at DESC;

-- 2. Check if there are any orders in the system
SELECT 
    COUNT(*) as total_orders,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
    COUNT(CASE WHEN status IN ('received', 'confirmed', 'preparing', 'on_the_way') THEN 1 END) as pending_orders
FROM orders;

-- 3. Check orders by cafe (if any exist)
SELECT 
    c.name as cafe_name,
    COUNT(o.id) as order_count,
    COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as completed_count,
    SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END) as total_revenue
FROM cafes c
LEFT JOIN orders o ON c.id = o.cafe_id
GROUP BY c.id, c.name
ORDER BY order_count DESC;

-- 4. Check recent orders (last 7 days)
SELECT 
    o.order_number,
    o.status,
    o.total_amount,
    o.customer_name,
    o.created_at,
    c.name as cafe_name
FROM orders o
JOIN cafes c ON o.cafe_id = c.id
WHERE o.created_at >= NOW() - INTERVAL '7 days'
ORDER BY o.created_at DESC
LIMIT 10;

-- 5. Check if there are any menu items
SELECT 
    c.name as cafe_name,
    COUNT(mi.id) as menu_item_count
FROM cafes c
LEFT JOIN menu_items mi ON c.id = mi.cafe_id
GROUP BY c.id, c.name
ORDER BY menu_item_count DESC;

-- 6. Check order items (if any exist)
SELECT 
    oi.order_id,
    oi.quantity,
    oi.unit_price,
    oi.total_price,
    mi.name as item_name,
    o.order_number
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN menu_items mi ON oi.menu_item_id = mi.id
ORDER BY o.created_at DESC
LIMIT 10;
