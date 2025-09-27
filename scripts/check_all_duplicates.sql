-- Check for ALL duplicate items in Cook House across all categories
-- Run this in Supabase Dashboard → SQL Editor

-- Check duplicates by name, price, and veg status
SELECT 
    'DUPLICATES BY NAME/PRICE/VEG' as check_type,
    mi.name,
    mi.price,
    mi.is_vegetarian,
    mi.category,
    COUNT(*) as duplicate_count
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
GROUP BY mi.name, mi.price, mi.is_vegetarian, mi.category
HAVING COUNT(*) > 1
ORDER BY mi.category, mi.name;

-- Check duplicates by name only (regardless of price/veg)
SELECT 
    'DUPLICATES BY NAME ONLY' as check_type,
    mi.name,
    mi.category,
    COUNT(*) as duplicate_count,
    STRING_AGG(DISTINCT mi.price::text, ', ') as prices,
    STRING_AGG(DISTINCT mi.is_vegetarian::text, ', ') as veg_status
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
GROUP BY mi.name, mi.category
HAVING COUNT(*) > 1
ORDER BY mi.category, mi.name;

-- Show total items per category
SELECT 
    'TOTAL ITEMS PER CATEGORY' as check_type,
    mi.category,
    COUNT(*) as total_items
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
GROUP BY mi.category
ORDER BY mi.category;
