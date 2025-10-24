-- Query to cancel the specific Dialog order (DIA000001)
-- This will update the order status to 'cancelled'

UPDATE orders 
SET 
    status = 'cancelled',
    status_updated_at = NOW(),
    updated_at = NOW()
WHERE order_number = 'DIA000001';

-- Verification query to check if the update was successful
-- Uncomment the section below to verify the order status after update

/*
SELECT 
    o.id as order_id,
    o.order_number,
    c.name as cafe_name,
    o.customer_name,
    o.customer_phone,
    o.delivery_block,
    o.status,
    o.payment_method,
    o.total_amount,
    o.created_at as order_date,
    o.status_updated_at,
    o.updated_at as last_updated
FROM orders o
JOIN cafes c ON o.cafe_id = c.id
WHERE o.order_number = 'DIA000001';
*/

-- Alternative query to cancel by order ID instead of order number
-- Uncomment the section below if you prefer to use the order ID

/*
UPDATE orders 
SET 
    status = 'cancelled',
    status_updated_at = NOW(),
    updated_at = NOW()
WHERE id = '1b325097-5aaf-443a-aa50-66c6b17dac66';
*/
