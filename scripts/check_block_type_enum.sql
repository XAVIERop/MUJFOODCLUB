-- Check what values are currently in the block_type enum
-- Run this in Supabase SQL Editor

-- 1. Check the current enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'block_type'
)
ORDER BY enumlabel;

-- 2. Check if the column is actually using block_type enum or VARCHAR
SELECT 
    column_name,
    data_type,
    udt_name,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name = 'delivery_block';
