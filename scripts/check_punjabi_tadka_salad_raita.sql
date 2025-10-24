-- Check current Salad & Raita items for Punjabi Tadka
SELECT 
    mi.id,
    mi.name,
    mi.category,
    mi.is_available,
    mi.price,
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
    )
ORDER BY mi.name;
