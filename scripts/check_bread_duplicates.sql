-- Check for duplicate bread items in Cook House
-- Run this in Supabase Dashboard → SQL Editor

SELECT 
    'BREAD DUPLICATES CHECK' as status,
    mi.name,
    mi.price,
    mi.is_vegetarian,
    COUNT(*) as duplicate_count
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Breads'
GROUP BY mi.name, mi.price, mi.is_vegetarian
HAVING COUNT(*) > 1
ORDER BY mi.name;

-- Show all bread items
SELECT 
    'ALL BREAD ITEMS' as status,
    mi.name,
    mi.price,
    mi.is_vegetarian,
    mi.id
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Breads'
ORDER BY mi.name, mi.is_vegetarian;
