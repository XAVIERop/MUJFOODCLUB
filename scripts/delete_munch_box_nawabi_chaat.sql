-- Delete all items from the 'Nawabi Chaat' category for Munch Box cafe
DELETE FROM public.menu_items
WHERE 
    cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%munch box%')
    AND (
        category ILIKE '%nawabi chaat%'
        OR name ILIKE '%nawabi chaat%'
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
        mi.category ILIKE '%nawabi chaat%'
        OR mi.name ILIKE '%nawabi chaat%'
    );
