-- Check the current availability status of Punjabi Tadka menu items
SELECT 
    mi.id,
    mi.name,
    mi.category,
    mi.is_available,
    mi.out_of_stock,
    mi.price,
    c.name as cafe_name
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE 
    c.name ILIKE '%punjabi tadka%'
ORDER BY mi.category, mi.name
LIMIT 20;
