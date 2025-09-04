-- Simple debug script - run this first
-- This will show us exactly what's in your database

-- 1. Check if priority column exists
SELECT 'Priority column exists:' as check_type, 
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'cafes' AND column_name = 'priority'
       ) THEN 'YES' ELSE 'NO' END as result;

-- 2. Show all cafes with their current data
SELECT 
    name,
    COALESCE(priority::text, 'NULL') as priority,
    COALESCE(average_rating::text, 'NULL') as rating,
    COALESCE(total_ratings::text, 'NULL') as total_ratings,
    is_active
FROM public.cafes 
ORDER BY name
LIMIT 20;

-- 3. Check if the function exists
SELECT 'Function exists:' as check_type,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.routines 
           WHERE routine_name = 'get_cafes_ordered'
       ) THEN 'YES' ELSE 'NO' END as result;

-- 4. Try to call the function (this might fail if it doesn't exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_cafes_ordered') THEN
        RAISE NOTICE 'Function exists - trying to call it...';
    ELSE
        RAISE NOTICE 'Function does NOT exist!';
    END IF;
END $$;
