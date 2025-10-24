-- Mark specific items as out of stock for Punjabi Tadka
UPDATE public.menu_items
SET 
    is_available = false,
    updated_at = NOW()
WHERE 
    cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%punjabi tadka%')
    AND (
        name ILIKE '%hara bhara kabab%'
        OR name ILIKE '%paneer malai tikka%'
        OR name ILIKE '%paneer tikka%'
        OR name ILIKE '%salad & raita%'
    );

-- Verify the update
SELECT 
    mi.id,
    mi.name,
    mi.category,
    mi.is_available,
    c.name as cafe_name
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE 
    c.name ILIKE '%punjabi tadka%'
    AND (
        mi.name ILIKE '%hara bhara kabab%'
        OR mi.name ILIKE '%paneer malai tikka%'
        OR mi.name ILIKE '%paneer tikka%'
        OR mi.name ILIKE '%salad & raita%'
    )
ORDER BY mi.name;
