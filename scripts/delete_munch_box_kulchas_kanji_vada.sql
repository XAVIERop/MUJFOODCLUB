-- Delete kulchas and kanji vada items from Munch Box cafe
DELETE FROM public.menu_items
WHERE 
    cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%munch box%')
    AND (
        name ILIKE '%kulcha%'
        OR name ILIKE '%kanji vada%'
        OR category ILIKE '%kulcha%'
        OR category ILIKE '%kanji vada%'
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
        mi.name ILIKE '%kulcha%'
        OR mi.name ILIKE '%kanji vada%'
        OR mi.category ILIKE '%kulcha%'
        OR mi.category ILIKE '%kanji vada%'
    );
