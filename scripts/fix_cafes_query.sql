-- =====================================================
-- Fix Cafes Query Issue
-- =====================================================

-- 1. Check if is_active column exists in cafes table
SELECT 
    '=== CHECKING IS_ACTIVE COLUMN ===' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cafes' 
AND table_schema = 'public'
AND column_name = 'is_active';

-- 2. If is_active doesn't exist, add it
DO $$
BEGIN
    -- Check if is_active column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'cafes' 
        AND table_schema = 'public' 
        AND column_name = 'is_active'
    ) THEN
        -- Add is_active column with default true
        ALTER TABLE public.cafes 
        ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;
        
        RAISE NOTICE 'Added is_active column to cafes table';
    ELSE
        RAISE NOTICE 'is_active column already exists';
    END IF;
END $$;

-- 3. Update all existing cafes to be active
UPDATE public.cafes 
SET is_active = true 
WHERE is_active IS NULL;

-- 4. Verify cafes are now active
SELECT 
    '=== CAFES STATUS AFTER FIX ===' as section,
    COUNT(*) as total_cafes,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_cafes,
    COUNT(CASE WHEN accepting_orders = true THEN 1 END) as accepting_orders
FROM public.cafes;

-- 5. List cafes with their status
SELECT 
    '=== CAFES LIST ===' as section,
    name,
    is_active,
    accepting_orders,
    priority
FROM public.cafes 
ORDER BY priority DESC NULLS LAST, name;
