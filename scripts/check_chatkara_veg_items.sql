-- Check Chatkara cafe veg/non-veg items carefully
-- Run this in Supabase Dashboard → SQL Editor

-- Get Chatkara cafe ID first
SELECT 
    'CHATKARA CAFE INFO' as status,
    id,
    name,
    slug
FROM public.cafes 
WHERE name = 'CHATKARA';

-- Check all Chatkara items with their veg/non-veg status
SELECT 
    'CHATKARA ALL ITEMS' as status,
    mi.name,
    mi.price,
    mi.is_vegetarian,
    mi.category,
    mi.id
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'CHATKARA' 
ORDER BY mi.category, mi.name;

-- Summary counts
SELECT 
    'CHATKARA SUMMARY' as status,
    COUNT(*) as total_items,
    COUNT(CASE WHEN is_vegetarian = true THEN 1 END) as veg_items,
    COUNT(CASE WHEN is_vegetarian = false THEN 1 END) as non_veg_items,
    COUNT(CASE WHEN is_vegetarian IS NULL THEN 1 END) as null_items
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'CHATKARA';

-- Show items that might be incorrectly classified
SELECT 
    'POTENTIALLY INCORRECT CLASSIFICATION' as status,
    mi.name,
    mi.price,
    mi.is_vegetarian,
    mi.category
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'CHATKARA' 
AND (
    -- Items with "chicken" in name but marked as veg (EXCEPT items starting with "Veg")
    (mi.name ILIKE '%chicken%' AND mi.is_vegetarian = true AND NOT (mi.name ILIKE 'veg%')) OR
    -- Items with "mutton" in name but marked as veg (EXCEPT items starting with "Veg")
    (mi.name ILIKE '%mutton%' AND mi.is_vegetarian = true AND NOT (mi.name ILIKE 'veg%')) OR
    -- Items with "egg" in name but marked as veg
    (mi.name ILIKE '%egg%' AND mi.is_vegetarian = true) OR
    -- Items clearly veg but marked as non-veg
    (mi.name ILIKE '%paneer%' AND mi.is_vegetarian = false) OR
    (mi.name ILIKE '%dal%' AND mi.is_vegetarian = false) OR
    (mi.name ILIKE '%aloo%' AND mi.is_vegetarian = false)
)
ORDER BY mi.name;
