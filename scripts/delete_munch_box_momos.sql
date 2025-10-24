-- Delete all momo items from Munch Box cafe
DELETE FROM public.menu_items
WHERE 
    cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%munch box%')
    AND (
        name ILIKE '%momo%'
        OR category ILIKE '%momo%'
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
        mi.name ILIKE '%momo%'
        OR mi.category ILIKE '%momo%'
    );
