-- Fix Supabase Project Mismatch
-- This script addresses the issue where local and production are using different Supabase projects

-- 1. Check which Supabase project we're currently connected to
SELECT 'Current Supabase project check...' as status;

-- 2. Check if we have the correct project URL
SELECT 
    'Project URL: ' || current_setting('app.settings.supabase_url', true) as project_info
UNION ALL
SELECT 
    'Database: ' || current_database() as database_info
UNION ALL
SELECT 
    'Schema: ' || current_schema() as schema_info;

-- 3. Check if the cafes table exists and has data
SELECT 
    'Cafes table check...' as status,
    COUNT(*) as total_cafes,
    COUNT(*) FILTER (WHERE accepting_orders = true) as accepting_orders_true,
    COUNT(*) FILTER (WHERE is_active = true) as is_active_true
FROM public.cafes;

-- 4. Show sample cafe data
SELECT 
    'Sample cafe data:' as status,
    id,
    name,
    type,
    accepting_orders,
    is_active,
    priority,
    average_rating,
    total_ratings
FROM public.cafes
ORDER BY priority DESC, average_rating DESC
LIMIT 5;

-- 5. Test the get_cafes_ordered function
SELECT 'Testing get_cafes_ordered function...' as status;
SELECT COUNT(*) as function_result_count FROM get_cafes_ordered();

-- 6. Show function definition
SELECT 
    'Function definition check:' as status,
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'get_cafes_ordered';

-- 7. Check RLS policies on cafes table
SELECT 
    'RLS policies on cafes table:' as status,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'cafes';

-- 8. Check if RLS is enabled on cafes table
SELECT 
    'RLS status on cafes table:' as status,
    relname as table_name,
    relrowsecurity as rls_enabled
FROM pg_class 
WHERE relname = 'cafes';

SELECT 'Supabase project mismatch analysis complete!' as status;
