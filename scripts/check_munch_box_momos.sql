-- Check current Munch Box Gravy Momos structure
-- This will show us the existing momo items and their variants

-- Get Munch Box cafe ID and current momo items
SELECT 
    c.id as cafe_id,
    c.name as cafe_name,
    mi.id as menu_item_id,
    mi.name as item_name,
    mi.price,
    mi.description,
    mi.category,
    mi.is_available
FROM public.cafes c
JOIN public.menu_items mi ON c.id = mi.cafe_id
WHERE 
    c.name ILIKE '%munch box%'
    AND (mi.name ILIKE '%gravy%' OR mi.name ILIKE '%momos%')
ORDER BY mi.name;

-- Check if there are existing variants
SELECT 
    mi.name as item_name,
    miv.id as variant_id,
    miv.variant_name,
    miv.price_adjustment,
    miv.is_available
FROM public.menu_items mi
JOIN public.menu_item_variants miv ON mi.id = miv.menu_item_id
WHERE 
    mi.cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%munch box%')
    AND (mi.name ILIKE '%gravy%' OR mi.name ILIKE '%momos%')
ORDER BY mi.name, miv.variant_name;
