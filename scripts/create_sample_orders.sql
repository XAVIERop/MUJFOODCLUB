-- Create sample orders for analytics testing
-- This script creates sample orders for the current cafe to test analytics

-- First, let's check what cafes exist
SELECT id, name, accepting_orders FROM cafes WHERE accepting_orders = true LIMIT 5;

-- Create sample orders for testing analytics
-- Replace 'YOUR_CAFE_ID_HERE' with the actual cafe ID from the query above

INSERT INTO orders (
    id,
    order_number,
    cafe_id,
    user_id,
    status,
    total_amount,
    delivery_block,
    customer_name,
    phone_number,
    special_instructions,
    created_at,
    updated_at
) VALUES 
-- Order 1: Completed order from today
(
    gen_random_uuid(),
    'ORD-001',
    'YOUR_CAFE_ID_HERE', -- Replace with actual cafe ID
    (SELECT id FROM auth.users LIMIT 1), -- Use first user
    'completed',
    250.00,
    'Block A',
    'John Doe',
    '+91-9876543210',
    'Extra spicy',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour'
),
-- Order 2: Pending order from today
(
    gen_random_uuid(),
    'ORD-002',
    'YOUR_CAFE_ID_HERE', -- Replace with actual cafe ID
    (SELECT id FROM auth.users LIMIT 1),
    'preparing',
    180.00,
    'Block B',
    'Jane Smith',
    '+91-9876543211',
    'No onions',
    NOW() - INTERVAL '30 minutes',
    NOW() - INTERVAL '25 minutes'
),
-- Order 3: Completed order from yesterday
(
    gen_random_uuid(),
    'ORD-003',
    'YOUR_CAFE_ID_HERE', -- Replace with actual cafe ID
    (SELECT id FROM auth.users LIMIT 1),
    'completed',
    320.00,
    'Block C',
    'Mike Johnson',
    '+91-9876543212',
    'Extra cheese',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day' + INTERVAL '30 minutes'
),
-- Order 4: Cancelled order
(
    gen_random_uuid(),
    'ORD-004',
    'YOUR_CAFE_ID_HERE', -- Replace with actual cafe ID
    (SELECT id FROM auth.users LIMIT 1),
    'cancelled',
    150.00,
    'Block D',
    'Sarah Wilson',
    '+91-9876543213',
    'Cancel order',
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '2 hours'
);

-- Now create sample order items for these orders
-- You'll need to replace the order IDs with the actual IDs from the orders above
-- and menu_item_ids with actual menu item IDs from your menu_items table

-- First, let's see what menu items exist
SELECT id, name, price FROM menu_items WHERE cafe_id = 'YOUR_CAFE_ID_HERE' LIMIT 5;

-- Then create order items (replace with actual IDs)
/*
INSERT INTO order_items (
    id,
    order_id,
    menu_item_id,
    quantity,
    unit_price,
    total_price,
    special_instructions
) VALUES 
-- Items for Order 1
(gen_random_uuid(), 'ORDER_1_ID', 'MENU_ITEM_1_ID', 2, 125.00, 250.00, 'Extra spicy'),
-- Items for Order 2  
(gen_random_uuid(), 'ORDER_2_ID', 'MENU_ITEM_2_ID', 1, 180.00, 180.00, 'No onions'),
-- Items for Order 3
(gen_random_uuid(), 'ORDER_3_ID', 'MENU_ITEM_3_ID', 1, 320.00, 320.00, 'Extra cheese'),
-- Items for Order 4
(gen_random_uuid(), 'ORDER_4_ID', 'MENU_ITEM_4_ID', 1, 150.00, 150.00, 'Cancel order');
*/

-- Check the results
SELECT 
    o.order_number,
    o.status,
    o.total_amount,
    o.customer_name,
    o.created_at
FROM orders o 
WHERE o.cafe_id = 'YOUR_CAFE_ID_HERE'
ORDER BY o.created_at DESC;
