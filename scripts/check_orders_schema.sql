-- Check the current schema of the orders table
-- This will help us understand what columns exist and what the frontend is trying to insert

-- Step 1: Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'orders'
ORDER BY ordinal_position;

-- Step 2: Check if items column exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'orders' 
            AND column_name = 'items'
        ) 
        THEN 'EXISTS' 
        ELSE 'DOES NOT EXIST' 
    END as items_column_status;

-- Step 3: Check recent orders to see the structure
SELECT 
    id,
    order_number,
    user_id,
    cafe_id,
    total_amount,
    status,
    created_at
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 3;

-- Step 4: Check if there's a separate order_items table
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name LIKE '%order%'
ORDER BY table_name, ordinal_position;
