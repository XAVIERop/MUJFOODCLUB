-- Query to check phone number for specific order (1b325097-5aaf-443a-aa50-66c6b17dac66)
-- This will check if the phone number was captured by the POS dashboard

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
    -- Check if phone number exists and is not null
    CASE 
        WHEN o.customer_phone IS NULL THEN 'No phone number'
        WHEN o.customer_phone = '' THEN 'Empty phone number'
        ELSE 'Phone number: ' || o.customer_phone
    END as phone_status
FROM orders o
JOIN cafes c ON o.cafe_id = c.id
WHERE o.id = '1b325097-5aaf-443a-aa50-66c6b17dac66';

-- Alternative query to check all orders from Dialog cafe to see phone number patterns
-- Uncomment the section below if you want to see phone number patterns for Dialog

/*
SELECT 
    o.id as order_id,
    o.order_number,
    o.customer_name,
    o.customer_phone,
    o.created_at as order_date,
    CASE 
        WHEN o.customer_phone IS NULL THEN 'No phone number'
        WHEN o.customer_phone = '' THEN 'Empty phone number'
        ELSE 'Has phone number'
    END as phone_status
FROM orders o
JOIN cafes c ON o.cafe_id = c.id
WHERE c.name ILIKE '%dialog%'
ORDER BY o.created_at DESC
LIMIT 10;
*/

-- Query to check if there are any phone numbers stored for Dialog orders
-- Uncomment the section below to see phone number statistics for Dialog

/*
SELECT 
    COUNT(*) as total_orders,
    COUNT(o.customer_phone) as orders_with_phone,
    COUNT(*) - COUNT(o.customer_phone) as orders_without_phone,
    ROUND((COUNT(o.customer_phone)::float / COUNT(*)) * 100, 2) as phone_percentage
FROM orders o
JOIN cafes c ON o.cafe_id = c.id
WHERE c.name ILIKE '%dialog%';
*/
