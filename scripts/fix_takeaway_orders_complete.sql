-- Complete fix for takeaway orders
-- Run this in Supabase SQL Editor

-- Step 1: Add 'TAKEAWAY' to the block_type enum
ALTER TYPE block_type ADD VALUE 'TAKEAWAY';

-- Step 2: Verify the enum values
SELECT unnest(enum_range(NULL::block_type)) as block_type_values;

-- Step 3: Check if there are any existing orders with invalid block values
SELECT DISTINCT delivery_block, COUNT(*) as count 
FROM orders 
GROUP BY delivery_block 
ORDER BY delivery_block;

-- Step 4: Update any existing orders that might have invalid block values
-- (This shouldn't be necessary if the enum was properly set up, but just in case)
UPDATE orders 
SET delivery_block = 'TAKEAWAY' 
WHERE delivery_block NOT IN (
  SELECT unnest(enum_range(NULL::block_type))
);

-- Step 5: Verify the fix
SELECT 
  'Enum values after fix:' as status,
  string_agg(unnest(enum_range(NULL::block_type))::text, ', ') as block_types;
