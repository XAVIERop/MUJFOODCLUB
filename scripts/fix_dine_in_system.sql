-- Complete Dine-In System Fix
-- Run this in Supabase SQL Editor to fix the table_number column error

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
        RAISE NOTICE 'Added DINE_IN to block_type enum';
    ELSE
        RAISE NOTICE 'DINE_IN already exists in block_type enum';
    END IF;
END $$;

-- Step 2: Add table_number column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS table_number TEXT;

-- Step 3: Create index for performance
CREATE INDEX IF NOT EXISTS idx_orders_table_number ON public.orders(table_number);

-- Step 4: Verify the setup
SELECT 
  'Dine In system fix complete' as status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'orders' 
        AND table_schema = 'public' 
        AND column_name = 'table_number'
    ) THEN 'table_number column exists'
    ELSE 'table_number column missing'
  END as table_column_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_enum 
      WHERE enumlabel = 'DINE_IN' 
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'block_type')
    ) THEN 'DINE_IN enum value exists'
    ELSE 'DINE_IN enum value missing'
  END as enum_status;

-- Step 5: Show current block_type enum values
SELECT unnest(enum_range(NULL::block_type)) as block_type_values;
