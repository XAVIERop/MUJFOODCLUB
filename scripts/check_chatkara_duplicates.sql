-- Check for duplicate items in Chatkara menu
-- Run this in Supabase Dashboard → SQL Editor

SELECT 
    'CHATKARA DUPLICATES CHECK' as status,
    mi.name,
    mi.price,
    mi.is_vegetarian,
    mi.category,
    COUNT(*) as duplicate_count
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'CHATKARA' 
GROUP BY mi.name, mi.price, mi.is_vegetarian, mi.category
HAVING COUNT(*) > 1
ORDER BY mi.category, mi.name;

-- Show all Chatkara items with Half/Full variants
SELECT 
    'CHATKARA HALF/FULL ITEMS' as status,
    mi.name,
    mi.price,
    mi.is_vegetarian,
    mi.category,
    mi.id
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'CHATKARA' 
AND (mi.name ILIKE '%(half)%' OR mi.name ILIKE '%(full)%')
ORDER BY mi.name, mi.price;

-- Show all Chatkara items
SELECT 
    'ALL CHATKARA ITEMS' as status,
    mi.name,
    mi.price,
    mi.is_vegetarian,
    mi.category,
    mi.id
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'CHATKARA' 
ORDER BY mi.category, mi.name;
