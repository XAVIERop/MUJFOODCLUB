-- Mark all Chaap Starters and Chaap categories as out of stock for Punjabi Tadka

UPDATE public.menu_items
SET 
    is_available = false,
    updated_at = NOW()
WHERE 
    cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%punjabi tadka%')
    AND (
        category ILIKE '%chaap starters%'
        OR category ILIKE '%chaap%'
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
        mi.category ILIKE '%chaap starters%'
        OR mi.category ILIKE '%chaap%'
    )
ORDER BY mi.category, mi.name;

