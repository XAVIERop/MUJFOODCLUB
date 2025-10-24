-- Query to check the latest order at Dialog cafe with item names
-- This will show the most recent order from Dialog cafe with full details including items

SELECT 
    o.id as order_id,
    o.order_number,
    c.name as cafe_name,
    o.customer_name,
    o.customer_phone,
    o.delivery_block,
    o.table_number,
    o.status,
    o.payment_method,
    o.total_amount,
    o.created_at as order_date,
    o.updated_at as last_updated,
    o.completed_at,
    o.delivered_by_staff_id,
    -- Order items with names, quantities, and prices
    STRING_AGG(
        CONCAT(oi.quantity, 'x ', mi.name, ' (₹', oi.unit_price, ')'), 
        ', '
    ) as order_items
FROM orders o
JOIN cafes c ON o.cafe_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
WHERE c.name ILIKE '%dialog%'
GROUP BY o.id, o.order_number, c.name, o.customer_name, o.customer_phone, 
         o.delivery_block, o.table_number, o.status, o.payment_method, 
         o.total_amount, o.created_at, o.updated_at, o.completed_at, o.delivered_by_staff_id
ORDER BY o.created_at DESC
LIMIT 1;

-- Alternative query to show the latest 5 orders from Dialog cafe
-- Uncomment the section below if you want to see more recent orders

/*
SELECT 
    o.id as order_id,
    o.order_number,
    c.name as cafe_name,
    o.customer_name,
    o.customer_phone,
    o.delivery_block,
    o.table_number,
    o.status,
    o.payment_method,
    o.total_amount,
    o.created_at as order_date,
    o.updated_at as last_updated,
    o.completed_at,
    o.delivered_by_staff_id,
    (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
FROM orders o
JOIN cafes c ON o.cafe_id = c.id
WHERE c.name ILIKE '%dialog%'
ORDER BY o.created_at DESC
LIMIT 5;
*/

-- Query to show latest order with detailed items
-- Uncomment the section below if you want to see what items were ordered

/*
SELECT 
    o.id as order_id,
    o.order_number,
    c.name as cafe_name,
    o.customer_name,
    o.customer_phone,
    o.delivery_block,
    o.status,
    o.total_amount,
    o.created_at as order_date,
    -- Order items details
    STRING_AGG(
        CONCAT(oi.quantity, 'x ', mi.name, ' (₹', oi.unit_price, ')'), 
        ', '
    ) as order_items
FROM orders o
JOIN cafes c ON o.cafe_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
WHERE c.name ILIKE '%dialog%'
GROUP BY o.id, o.order_number, c.name, o.customer_name, o.customer_phone, 
         o.delivery_block, o.status, o.total_amount, o.created_at
ORDER BY o.created_at DESC
LIMIT 1;
*/
