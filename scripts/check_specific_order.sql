-- Check if the specific order exists in the database
-- This will help us understand if the order was created successfully

-- Step 1: Check if the order exists by ID
SELECT 
    id,
    order_number,
    user_id,
    cafe_id,
    total_amount,
    status,
    created_at,
    points_earned
FROM public.orders 
WHERE id = 'e68dce9b-7862-4e27-a97e-18ffcb2ec178';

-- Step 2: Check if the order exists by order_number (in case there's a mismatch)
SELECT 
    id,
    order_number,
    user_id,
    cafe_id,
    total_amount,
    status,
    created_at,
    points_earned
FROM public.orders 
WHERE order_number LIKE '%e68dce9b%' OR order_number LIKE '%7862%';

-- Step 3: Check the most recent orders to see what was actually created
SELECT 
    id,
    order_number,
    user_id,
    cafe_id,
    total_amount,
    status,
    created_at,
    points_earned
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 4: Check if order_items were created for the recent orders
SELECT 
    oi.id,
    oi.order_id,
    oi.menu_item_id,
    oi.quantity,
    oi.unit_price,
    oi.total_price,
    o.order_number
FROM public.order_items oi
JOIN public.orders o ON oi.order_id = o.id
ORDER BY o.created_at DESC
LIMIT 10;
