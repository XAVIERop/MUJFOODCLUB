-- Restore all missing columns that were accidentally removed during rewards cleanup
-- These columns were part of the original working schema

-- Step 1: Check current orders table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'orders'
ORDER BY ordinal_position;

-- Step 2: Add all missing columns
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
        RAISE NOTICE 'Added points_earned column';
    ELSE
        RAISE NOTICE 'points_earned column already exists';
    END IF;

    -- Add points_credited column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'points_credited'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN points_credited BOOLEAN NOT NULL DEFAULT FALSE;
        RAISE NOTICE 'Added points_credited column';
    ELSE
        RAISE NOTICE 'points_credited column already exists';
    END IF;

    -- Add status_updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'status_updated_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN status_updated_at TIMESTAMPTZ DEFAULT now();
        RAISE NOTICE 'Added status_updated_at column';
    ELSE
        RAISE NOTICE 'status_updated_at column already exists';
    END IF;

    -- Add accepted_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'accepted_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN accepted_at TIMESTAMPTZ;
        RAISE NOTICE 'Added accepted_at column';
    ELSE
        RAISE NOTICE 'accepted_at column already exists';
    END IF;

    -- Add preparing_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'preparing_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN preparing_at TIMESTAMPTZ;
        RAISE NOTICE 'Added preparing_at column';
    ELSE
        RAISE NOTICE 'preparing_at column already exists';
    END IF;

    -- Add out_for_delivery_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'out_for_delivery_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN out_for_delivery_at TIMESTAMPTZ;
        RAISE NOTICE 'Added out_for_delivery_at column';
    ELSE
        RAISE NOTICE 'out_for_delivery_at column already exists';
    END IF;

    -- Add completed_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN completed_at TIMESTAMPTZ;
        RAISE NOTICE 'Added completed_at column';
    ELSE
        RAISE NOTICE 'completed_at column already exists';
    END IF;
END $$;

-- Step 3: Verify all columns were added
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
SELECT 'All missing columns restoration complete - order status updates should work now' as status;
