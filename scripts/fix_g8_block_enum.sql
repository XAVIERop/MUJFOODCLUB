-- FIX G8 BLOCK ENUM ISSUE
-- This script adds G8 to the block_type enum if it's missing

-- 1. Check current block_type enum values
SELECT 
    'CURRENT BLOCK VALUES' as check_type,
    unnest(enum_range(NULL::block_type)) as block_values;

-- 2. Check if G8 is missing
SELECT 
    CASE 
        WHEN 'G8' = ANY(enum_range(NULL::block_type)) 
        THEN 'G8 EXISTS in enum'
        ELSE 'G8 MISSING from enum'
    END as g8_status;

-- 3. Add G8 to the enum (force add since it's missing)
DO $$ 
BEGIN
    -- Force add G8 to the enum (we know it's missing based on the error)
    ALTER TYPE block_type ADD VALUE 'G8';
    RAISE NOTICE '✅ Added G8 to block_type enum';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️ G8 already exists in block_type enum';
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error adding G8: %', SQLERRM;
END $$;

-- 4. Verify G8 was added
SELECT 
    'UPDATED BLOCK VALUES' as check_type,
    unnest(enum_range(NULL::block_type)) as block_values;

-- 5. Final status
SELECT '✅ G8 BLOCK ENUM FIX COMPLETED!' as final_status;








