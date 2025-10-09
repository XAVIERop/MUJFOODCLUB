-- Delete all Sweet & Beverages category items from Munch Box cafe
DELETE FROM public.menu_items
WHERE 
    cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%munch box%')
    AND (
        category ILIKE '%sweet%'
        OR category ILIKE '%beverage%'
        OR category ILIKE '%drink%'
        OR name ILIKE '%sweet%'
        OR name ILIKE '%beverage%'
        OR name ILIKE '%drink%'
    );

-- Verify the deletion
SELECT 
    mi.id,
    mi.name,
    mi.category,
    c.name as cafe_name
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE 
    c.name ILIKE '%munch box%'
    AND (
        mi.category ILIKE '%sweet%'
        OR mi.category ILIKE '%beverage%'
        OR mi.category ILIKE '%drink%'
        OR mi.name ILIKE '%sweet%'
        OR mi.name ILIKE '%beverage%'
        OR mi.name ILIKE '%drink%'
    );
