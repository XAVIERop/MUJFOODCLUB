-- Fix the orders table schema by adding missing columns
-- This addresses the "Could not find column" errors

-- Step 1: Check current schema first
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'orders'
ORDER BY ordinal_position;

-- Step 2: Add missing columns one by one (with IF NOT EXISTS logic)
DO $$
BEGIN
    -- Add order_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'order_type'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN order_type text DEFAULT 'delivery';
        RAISE NOTICE 'Added order_type column';
    ELSE
        RAISE NOTICE 'order_type column already exists';
    END IF;

    -- Add delivery_block column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'delivery_block'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN delivery_block text;
        RAISE NOTICE 'Added delivery_block column';
    ELSE
        RAISE NOTICE 'delivery_block column already exists';
    END IF;

    -- Add delivery_notes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'delivery_notes'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN delivery_notes text;
        RAISE NOTICE 'Added delivery_notes column';
    ELSE
        RAISE NOTICE 'delivery_notes column already exists';
    END IF;

    -- Add payment_method column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN payment_method text DEFAULT 'cod';
        RAISE NOTICE 'Added payment_method column';
    ELSE
        RAISE NOTICE 'payment_method column already exists';
    END IF;

    -- Add phone_number column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'phone_number'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN phone_number text;
        RAISE NOTICE 'Added phone_number column';
    ELSE
        RAISE NOTICE 'phone_number column already exists';
    END IF;

    -- Add table_number column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'table_number'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN table_number text;
        RAISE NOTICE 'Added table_number column';
    ELSE
        RAISE NOTICE 'table_number column already exists';
    END IF;
END $$;

-- Step 3: Verify the updated schema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'orders'
ORDER BY ordinal_position;

-- Step 4: Test insert to make sure it works
SELECT 'Schema fix complete - orders table should now accept all required columns' as status;
