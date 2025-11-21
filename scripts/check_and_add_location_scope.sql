-- Check if location_scope column exists, and add it if missing
-- This is a safe script that checks before adding

-- First, check current structure
SELECT 
    'Current cafes table columns:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'cafes'
ORDER BY column_name;

-- Check if location_scope column exists
DO $$
BEGIN
    -- Create enum type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cafe_scope') THEN
        CREATE TYPE cafe_scope AS ENUM ('ghs', 'off_campus');
        RAISE NOTICE 'Created cafe_scope enum type';
    ELSE
        RAISE NOTICE 'cafe_scope enum type already exists';
    END IF;

    -- Add location_scope column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'cafes' 
        AND column_name = 'location_scope'
    ) THEN
        ALTER TABLE public.cafes
        ADD COLUMN location_scope cafe_scope NOT NULL DEFAULT 'ghs';
        
        RAISE NOTICE 'Added location_scope column to cafes table';
    ELSE
        RAISE NOTICE 'location_scope column already exists';
    END IF;
END $$;

-- Verify the column was added
SELECT 
    'Updated cafes table columns:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'cafes'
AND column_name = 'location_scope';

-- Show current cafes with their location_scope
SELECT 
    name,
    slug,
    location_scope,
    location
FROM public.cafes
ORDER BY name;


