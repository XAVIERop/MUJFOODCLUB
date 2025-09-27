-- Step 3: Verify all data is restored correctly
-- Run this in Supabase Dashboard → SQL Editor

-- Check total counts
SELECT 
    'RESTORATION VERIFICATION' as status,
    COUNT(*) as total_cafes
FROM public.cafes;

SELECT 
    'MENU ITEMS COUNT' as status,
    COUNT(*) as total_menu_items
FROM public.menu_items;

-- Check specific cafes
SELECT 
    'CAFE LIST' as status,
    name,
    location,
    is_active
FROM public.cafes 
ORDER BY name;

-- Check Cook House specifically (most important)
SELECT 
    'COOK HOUSE CHECK' as status,
    name,
    location,
    phone,
    is_active
FROM public.cafes 
WHERE name = 'COOK HOUSE';

-- Check Cook House menu items
SELECT 
    'COOK HOUSE MENU' as status,
    COUNT(*) as menu_item_count
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE';

-- Check bread items specifically (the original issue)
SELECT 
    'BREAD ITEMS CHECK' as status,
    name,
    price
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Breads'
ORDER BY name;

-- Final verification
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM public.cafes) > 0 
        AND (SELECT COUNT(*) FROM public.menu_items) > 0
        THEN '✅ DATABASE RESTORATION SUCCESSFUL'
        ELSE '❌ DATABASE RESTORATION FAILED'
    END as final_status;
