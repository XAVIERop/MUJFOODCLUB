-- Add customer_name and phone_number columns to orders table if they don't exist
-- This ensures POS dashboard can display real customer information

-- Check current table structure
SELECT 'Current orders table structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'orders'
AND column_name IN ('customer_name', 'phone_number')
ORDER BY column_name;

-- Add customer_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'customer_name'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN customer_name TEXT;
        RAISE NOTICE 'Added customer_name column to orders table';
    ELSE
        RAISE NOTICE 'customer_name column already exists';
    END IF;
END $$;

-- Add phone_number column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'phone_number'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN phone_number TEXT;
        RAISE NOTICE 'Added phone_number column to orders table';
    ELSE
        RAISE NOTICE 'phone_number column already exists';
    END IF;
END $$;

-- Verify the columns were added
SELECT 'Updated orders table structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'orders'
AND column_name IN ('customer_name', 'phone_number')
ORDER BY column_name;

SELECT '✅ Customer columns added to orders table successfully!' as status;
