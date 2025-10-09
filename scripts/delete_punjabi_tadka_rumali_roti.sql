-- Delete Rumali Roti and Butter Rumali Roti items from Punjabi Tadka
DELETE FROM public.menu_items
WHERE 
    cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%punjabi tadka%')
    AND (
        name ILIKE '%rumali roti%'
        OR name ILIKE '%butter rumali roti%'
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
        mi.name ILIKE '%rumali roti%'
        OR mi.name ILIKE '%butter rumali roti%'
    );
