-- Debug script to check cafe priority system
-- Run this in your Supabase SQL Editor to diagnose the issue

-- 1. Check if priority column exists
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cafes' 
AND column_name = 'priority';

-- 2. Check current priority values for key cafes
SELECT 
    name,
    priority,
    average_rating,
    total_ratings,
    is_active
FROM public.cafes 
WHERE name ILIKE '%chatkara%' 
   OR name ILIKE '%food court%' 
   OR name ILIKE '%mini meals%'
   OR name ILIKE '%dialog%'
ORDER BY priority NULLS LAST, average_rating DESC NULLS LAST;

-- 3. Check if the function exists
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'get_cafes_ordered';

-- 4. Test the function directly
SELECT 
    name,
    priority,
    average_rating,
    total_ratings
FROM get_cafes_ordered() 
LIMIT 10;

-- 5. Check all cafes with their priorities
SELECT 
    name,
    priority,
    average_rating,
    total_ratings
FROM public.cafes 
ORDER BY 
    COALESCE(priority, 999),
    average_rating DESC NULLS LAST,
    total_ratings DESC NULLS LAST,
    name
LIMIT 10;
