-- Check if table_number column exists and add it if missing
-- Run this in Supabase SQL Editor

-- 1. Check if table_number column exists
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name = 'table_number';

-- 2. Add table_number column if it doesn't exist
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS table_number VARCHAR(10);

-- 3. Verify the column was added
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name = 'table_number';

-- 4. Check if any existing orders have table_number data
SELECT 
    id,
    order_number,
    delivery_block,
    table_number,
    created_at
FROM public.orders 
WHERE delivery_block = 'DINE_IN'
ORDER BY created_at DESC
LIMIT 5;
