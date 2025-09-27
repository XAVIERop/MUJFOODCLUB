-- Check if database data still exists
-- Run this in Supabase Dashboard → SQL Editor

-- Check if tables exist
SELECT 
    'TABLES CHECK' as status,
    table_name,
    'EXISTS' as table_status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('cafes', 'menu_items', 'profiles', 'orders', 'order_items')
ORDER BY table_name;

-- Check if cafes exist
SELECT 
    'CAFES CHECK' as status,
    COUNT(*) as cafe_count,
    CASE 
        WHEN COUNT(*) > 0 THEN 'CAFES EXIST'
        ELSE 'NO CAFES FOUND'
    END as cafe_status
FROM public.cafes;

-- Check if menu items exist
SELECT 
    'MENU ITEMS CHECK' as status,
    COUNT(*) as menu_item_count,
    CASE 
        WHEN COUNT(*) > 0 THEN 'MENU ITEMS EXIST'
        ELSE 'NO MENU ITEMS FOUND'
    END as menu_status
FROM public.menu_items;

-- Check specific cafes
SELECT 
    'SPECIFIC CAFES' as status,
    name,
    id,
    is_active
FROM public.cafes 
WHERE name IN ('COOK HOUSE', 'CHATKARA', 'FOOD COURT', 'PUNJABI TADKA')
ORDER BY name;

-- Check Cook House menu items
SELECT 
    'COOK HOUSE MENU' as status,
    COUNT(*) as cook_house_items
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE';
