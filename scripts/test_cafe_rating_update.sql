-- Test script to verify cafe rating updates
-- This script helps test if the rating system is working correctly

-- 1. Check current cafe ratings
SELECT 
    id,
    name,
    average_rating,
    total_ratings
FROM public.cafes 
WHERE name LIKE '%Chatkara%' OR name LIKE '%Mini Meals%'
ORDER BY name;

-- 2. Check if cafe_ratings table has data
SELECT 
    cr.cafe_id,
    c.name as cafe_name,
    cr.user_id,
    cr.rating,
    cr.review,
    cr.created_at
FROM public.cafe_ratings cr
JOIN public.cafes c ON cr.cafe_id = c.id
ORDER BY cr.created_at DESC
LIMIT 10;

-- 3. Check if order_ratings table has data
SELECT 
    or.order_id,
    or.rating,
    or.review,
    or.created_at,
    o.order_number,
    c.name as cafe_name
FROM public.order_ratings or
JOIN public.orders o ON or.order_id = o.id
JOIN public.cafes c ON o.cafe_id = c.id
ORDER BY or.created_at DESC
LIMIT 10;

-- 4. Check the trigger function exists
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'update_cafe_rating';

-- 5. Check if triggers are active
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name LIKE '%cafe_rating%';
