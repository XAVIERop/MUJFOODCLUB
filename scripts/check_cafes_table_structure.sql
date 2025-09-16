-- Check the actual structure of the cafes table
-- This will help us understand what columns exist and what the data looks like

-- 1. Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'cafes'
ORDER BY ordinal_position;

-- 2. Check sample data
SELECT 
    id,
    name,
    type,
    description,
    location,
    accepting_orders,
    is_active,
    priority,
    average_rating,
    total_ratings,
    created_at
FROM public.cafes
LIMIT 5;

-- 3. Check if there are any cafes with accepting_orders = true
SELECT 
    COUNT(*) as total_cafes,
    COUNT(*) FILTER (WHERE accepting_orders = true) as accepting_orders_true,
    COUNT(*) FILTER (WHERE is_active = true) as is_active_true
FROM public.cafes;

-- 4. Check if there are any cafes at all
SELECT COUNT(*) as total_cafes FROM public.cafes;
