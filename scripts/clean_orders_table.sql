-- =====================================================
-- Clean Orders Table for Simplified Version
-- =====================================================

-- 1. Remove rewards-related columns from orders table
ALTER TABLE public.orders DROP COLUMN IF EXISTS points_earned;
ALTER TABLE public.orders DROP COLUMN IF EXISTS points_credited;

-- 2. Verify the cleaned orders table structure
SELECT 
    '=== CLEANED ORDERS TABLE STRUCTURE ===' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Show remaining columns count
SELECT 
    '=== COLUMN COUNT ===' as section,
    COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public';
