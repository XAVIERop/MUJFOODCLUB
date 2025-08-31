-- Test script to check rating system setup
-- Run this in Supabase SQL Editor to see what's missing

-- Check if order_ratings table exists
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'order_ratings'
ORDER BY ordinal_position;

-- Check if orders table has rating columns
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('has_rating', 'rating_submitted_at', 'phone_number')
ORDER BY column_name;

-- Check if cafes table has rating columns
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'cafes' 
AND column_name IN ('average_rating', 'total_ratings')
ORDER BY column_name;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('order_ratings', 'orders', 'cafes')
ORDER BY tablename, policyname;
