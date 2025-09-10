-- Fix takeaway orders by adding 'TAKEAWAY' to block_type enum
-- Run this in Supabase SQL Editor

-- Add 'TAKEAWAY' to the block_type enum
ALTER TYPE block_type ADD VALUE 'TAKEAWAY';

-- Verify the enum values
SELECT unnest(enum_range(NULL::block_type)) as block_type_values;
