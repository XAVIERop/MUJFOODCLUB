-- Query to show last 50 orders from all cafes
-- This will display the most recent orders across all cafes with relevant details

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
    -- Count of items in the order
    (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
FROM orders o
JOIN cafes c ON o.cafe_id = c.id
WHERE c.is_active = true
ORDER BY o.created_at DESC
LIMIT 50;

-- Alternative query with more detailed information including order items
-- Uncomment the section below if you want to see individual items in each order

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
    -- Order items details
    STRING_AGG(
        CONCAT(oi.quantity, 'x ', mi.name, ' (₹', oi.unit_price, ')'), 
        ', '
    ) as order_items,
    -- Staff who delivered (if any)
    p.full_name as delivered_by
FROM orders o
JOIN cafes c ON o.cafe_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
LEFT JOIN profiles p ON o.delivered_by_staff_id = p.id
WHERE c.is_active = true
GROUP BY o.id, o.order_number, c.name, o.customer_name, o.customer_phone, 
         o.delivery_block, o.table_number, o.status, o.payment_method, 
         o.total_amount, o.created_at, p.full_name
ORDER BY o.created_at DESC
LIMIT 50;
*/
