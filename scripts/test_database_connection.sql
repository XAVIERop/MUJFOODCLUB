-- Quick test to check database connection
-- Run this in Supabase SQL Editor

-- 1. Test basic connection
SELECT 'Database Connection Test' as test_name;
SELECT NOW() as current_time;

-- 2. Check if we can read tables
SELECT 'Available Tables' as test_name;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 3. Check if cafes table has any data
SELECT 'Cafes Count' as test_name;
SELECT COUNT(*) as cafe_count FROM public.cafes;

-- 4. If no cafes, show what tables we have
SELECT 'Table Summary' as test_name;
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_name IN ('cafes', 'menu_items', 'users', 'orders', 'profiles')
ORDER BY table_name;
