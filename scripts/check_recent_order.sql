-- Check the most recent order to see what columns were actually inserted
-- This will help us understand what the working system was doing

-- Step 1: Get the most recent order
SELECT 
    id,
    order_number,
    user_id,
    cafe_id,
    total_amount,
    delivery_block,
    delivery_notes,
    payment_method,
    points_earned,
    estimated_delivery,
    status,
    created_at,
    updated_at,
    phone_number,
    table_number,
    status_updated_at,
    points_credited,
    has_rating,
    rating_submitted_at
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 1;

-- Step 2: Check what columns actually exist in the orders table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'orders'
ORDER BY ordinal_position;

-- Step 3: Check if the recent order has phone_number and table_number
SELECT 
    CASE 
        WHEN phone_number IS NOT NULL THEN 'HAS phone_number: ' || phone_number
        ELSE 'NO phone_number'
    END as phone_status,
    CASE 
        WHEN table_number IS NOT NULL THEN 'HAS table_number: ' || table_number
        ELSE 'NO table_number'
    END as table_status
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 1;
