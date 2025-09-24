-- Check if table_number column exists in orders table
-- Run this script in your Supabase SQL Editor

-- 1. Check if table_number column exists
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name = 'table_number';

-- 2. If column doesn't exist, add it
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS table_number VARCHAR(10);

-- 3. Check all columns in orders table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
