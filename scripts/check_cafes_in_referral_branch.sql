-- Check if cafes exist in the referral-system branch
-- Run this in Supabase SQL Editor on the referral-system branch

-- 1. Check if cafes table exists
SELECT 'Cafes Table Check' as test_name;
SELECT 
    table_name,
    'Table exists' as status
FROM information_schema.tables 
WHERE table_name = 'cafes' AND table_schema = 'public';

-- 2. Check if cafes have data
SELECT 'Cafes Data Check' as test_name;
SELECT 
    COUNT(*) as total_cafes,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_cafes,
    COUNT(CASE WHEN accepting_orders = true THEN 1 END) as accepting_orders
FROM public.cafes;

-- 3. Show all cafes
SELECT 'All Cafes' as test_name;
SELECT 
    id,
    name,
    slug,
    is_active,
    accepting_orders,
    priority,
    created_at
FROM public.cafes 
ORDER BY priority, name;

-- 4. Check if menu_items exist
SELECT 'Menu Items Check' as test_name;
SELECT 
    COUNT(*) as total_items,
    COUNT(DISTINCT cafe_id) as cafes_with_items
FROM public.menu_items;

-- 5. Check specific cafe data
SELECT 'Cafe Details' as test_name;
SELECT 
    c.name as cafe_name,
    c.is_active,
    c.accepting_orders,
    COUNT(mi.id) as menu_items_count
FROM public.cafes c
LEFT JOIN public.menu_items mi ON c.id = mi.cafe_id
GROUP BY c.id, c.name, c.is_active, c.accepting_orders
ORDER BY c.priority, c.name;
