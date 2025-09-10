-- Complete Dine-In System Fix
-- Run this in Supabase SQL Editor to fix all dine-in issues

-- Step 1: Add DINE_IN to block_type enum (if not already added)
DO $$ 
BEGIN
    -- Check if 'DINE_IN' already exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'DINE_IN' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'block_type')
    ) THEN
        ALTER TYPE block_type ADD VALUE 'DINE_IN';
        RAISE NOTICE '✅ Added DINE_IN to block_type enum';
    ELSE
        RAISE NOTICE '✅ DINE_IN already exists in block_type enum';
    END IF;
END $$;

-- Step 2: Add table_number column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS table_number TEXT;

-- Step 3: Create index for performance
CREATE INDEX IF NOT EXISTS idx_orders_table_number ON public.orders(table_number);

-- Step 4: Update existing DINE_IN orders to have sample table numbers
UPDATE public.orders 
SET table_number = '1' 
WHERE delivery_block = 'DINE_IN' 
  AND (table_number IS NULL OR table_number = '');

-- Step 5: Verify the setup
SELECT 
  'Dine In system fix complete' as status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'orders' 
        AND table_schema = 'public' 
        AND column_name = 'table_number'
    ) THEN '✅ table_number column exists'
    ELSE '❌ table_number column missing'
  END as table_column_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_enum 
      WHERE enumlabel = 'DINE_IN' 
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'block_type')
    ) THEN '✅ DINE_IN enum value exists'
    ELSE '❌ DINE_IN enum value missing'
  END as enum_status;

-- Step 6: Show current block_type enum values
SELECT 'Current block_type values:' as info;
SELECT unnest(enum_range(NULL::block_type)) as block_type_values;

-- Step 7: Show dine-in orders and their table numbers
SELECT 'Dine-in orders with table numbers:' as info;
SELECT 
  id,
  order_number,
  delivery_block,
  table_number,
  created_at
FROM public.orders 
WHERE delivery_block = 'DINE_IN'
ORDER BY created_at DESC 
LIMIT 10;

-- Step 8: Count orders by type
SELECT 'Order type distribution:' as info;
SELECT 
  delivery_block,
  COUNT(*) as count,
  COUNT(table_number) as with_table_number
FROM public.orders 
GROUP BY delivery_block
ORDER BY count DESC;
