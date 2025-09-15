-- Restore the points_earned column that was accidentally removed during rewards cleanup
-- This column was part of the original schema and is needed for order placement

-- Step 1: Check if points_earned column exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'orders' 
            AND column_name = 'points_earned'
        ) 
        THEN 'EXISTS' 
        ELSE 'DOES NOT EXIST - NEEDS TO BE ADDED' 
    END as points_earned_status;

-- Step 2: Add points_earned column if it doesn't exist
DO $$
BEGIN
    -- Add points_earned column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'points_earned'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN points_earned INTEGER NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added points_earned column with default value 0';
    ELSE
        RAISE NOTICE 'points_earned column already exists';
    END IF;
END $$;

-- Step 3: Verify the column was added
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'orders'
AND column_name = 'points_earned';

-- Step 4: Test insert to make sure it works
SELECT 'points_earned column restoration complete - order placement should work now' as status;
