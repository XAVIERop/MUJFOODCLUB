-- Check current Gravy Momos structure in Munch Box
-- Run this first to see what we're working with

SELECT 
    id,
    name,
    price,
    description,
    category,
    subcategory,
    cafe_id,
    created_at
FROM public.menu_items 
WHERE 
    cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%munch box%')
    AND (name ILIKE '%gravy%' OR name ILIKE '%momos%')
ORDER BY name;
