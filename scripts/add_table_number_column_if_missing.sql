-- Add table_number column to orders table if it doesn't exist
-- Run this in Supabase SQL Editor

-- Check if table_number column exists
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name = 'table_number';

-- Add table_number column if it doesn't exist
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS table_number VARCHAR(10);

-- Verify the column was added
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name = 'table_number';
