-- Delete all Salad & Raita items from Punjabi Tadka
DELETE FROM public.menu_items
WHERE 
    cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%punjabi tadka%')
    AND (
        category ILIKE '%salad%'
        OR category ILIKE '%raita%'
        OR name ILIKE '%salad%'
        OR name ILIKE '%raita%'
        OR name ILIKE '%dahi%'
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
    c.name ILIKE '%punjabi tadka%'
    AND (
        mi.category ILIKE '%salad%'
        OR mi.category ILIKE '%raita%'
        OR mi.name ILIKE '%salad%'
        OR mi.name ILIKE '%raita%'
        OR mi.name ILIKE '%dahi%'
    );
