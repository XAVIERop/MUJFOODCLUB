-- Check for duplicate soup items in Cook House
-- Run this in Supabase Dashboard → SQL Editor

SELECT 
    'SOUP DUPLICATES CHECK' as status,
    mi.name,
    mi.price,
    mi.is_vegetarian,
    COUNT(*) as duplicate_count
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Soups'
GROUP BY mi.name, mi.price, mi.is_vegetarian
HAVING COUNT(*) > 1
ORDER BY mi.name;

-- Show all soup items
SELECT 
    'ALL SOUP ITEMS' as status,
    mi.name,
    mi.price,
    mi.is_vegetarian,
    mi.id
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Soups'
ORDER BY mi.name, mi.is_vegetarian;
