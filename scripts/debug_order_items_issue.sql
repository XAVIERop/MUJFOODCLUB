-- Debug Order Items Issue
-- This will help identify the exact problem

-- 1. First, let's see what orders exist and their structure
SELECT 
    'Orders Structure' as test,
    id,
    order_number,
    total_amount,
    cafe_id,
    created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 3;

-- 2. Check if order_items exist for these orders
SELECT 
    'Order Items Check' as test,
    oi.order_id,
    COUNT(oi.id) as item_count,
    o.order_number
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
GROUP BY oi.order_id, o.order_number
ORDER BY o.created_at DESC
LIMIT 5;

-- 3. Test the exact query that the frontend uses
-- This simulates what POS Dashboard is trying to do
SELECT 
    'Frontend Query Test' as test,
    o.id,
    o.order_number,
    o.total_amount,
    o.cafe_id,
    oi.id as order_item_id,
    oi.quantity,
    oi.total_price,
    mi.name as menu_item_name
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
WHERE o.cafe_id = (
    SELECT cafe_id FROM profiles 
    WHERE user_type = 'cafe_owner' 
    LIMIT 1
)
ORDER BY o.created_at DESC
LIMIT 3;

-- 4. Check if there's a data issue - maybe orders were created without order_items
SELECT 
    'Orders without items' as test,
    o.id,
    o.order_number,
    o.total_amount,
    o.cafe_id
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE oi.id IS NULL
ORDER BY o.created_at DESC
LIMIT 5;

-- 5. Check RLS policies again to make sure they're correct
SELECT 
    'Current RLS Policies' as test,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('order_items', 'menu_items')
ORDER BY tablename, policyname;
