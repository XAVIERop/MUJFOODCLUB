-- Check if the table_number data is actually being stored
-- Run this in Supabase SQL Editor

-- Check the latest dine-in orders and their table_number values
SELECT 
    id,
    order_number,
    delivery_block,
    table_number,
    created_at,
    order_type
FROM public.orders 
WHERE delivery_block = 'DINE_IN'
ORDER BY created_at DESC
LIMIT 10;
