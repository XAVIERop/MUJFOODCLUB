-- Add DINE_IN and TAKEAWAY to block_type enum if they don't exist
-- Run this in Supabase SQL Editor

-- Check current enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'block_type'
)
ORDER BY enumlabel;

-- Add DINE_IN if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'block_type')
        AND enumlabel = 'DINE_IN'
    ) THEN
        ALTER TYPE block_type ADD VALUE 'DINE_IN';
    END IF;
END $$;

-- Add TAKEAWAY if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'block_type')
        AND enumlabel = 'TAKEAWAY'
    ) THEN
        ALTER TYPE block_type ADD VALUE 'TAKEAWAY';
    END IF;
END $$;

-- Verify the enum values were added
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'block_type'
)
ORDER BY enumlabel;
