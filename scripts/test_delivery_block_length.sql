-- Test if delivery_block field has length constraints
-- Run this script in your Supabase SQL Editor

-- 1. Check the current column definition for delivery_block
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name = 'delivery_block';

-- 2. Check if there are any constraints on delivery_block
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.orders'::regclass 
  AND conname LIKE '%delivery_block%';

-- 3. Try to insert a test record with long delivery_block value
INSERT INTO public.orders (
    user_id,
    cafe_id,
    order_number,
    total_amount,
    order_type,
    delivery_block,
    delivery_notes,
    payment_method,
    phone_number,
    customer_name,
    points_earned,
    status,
    estimated_delivery
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    'TEST-ORDER-001',
    100.00,
    'dine_in',
    'Table 1',
    'Test order',
    'cod',
    '1234567890',
    'Test User',
    0,
    'received',
    NOW() + INTERVAL '30 minutes'
);

-- 4. If successful, clean up the test record
DELETE FROM public.orders WHERE order_number = 'TEST-ORDER-001';
