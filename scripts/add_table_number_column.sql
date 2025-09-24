-- Add table_number column to orders table for dine-in orders
-- Run this script in your Supabase SQL Editor

-- 1. Add table_number column if it doesn't exist
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS table_number VARCHAR(10);

-- 2. Verify the column was added
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name = 'table_number';

-- 3. Check a recent dine-in order to see if table_number is stored
SELECT 
    order_number,
    order_type,
    delivery_block,
    table_number,
    created_at
FROM public.orders 
WHERE delivery_block = 'DINE_IN'
ORDER BY created_at DESC
LIMIT 5;