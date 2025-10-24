-- Check current bread items for Taste of India
SELECT 
    id,
    name,
    description,
    price,
    category,
    is_available,
    (SELECT name FROM public.cafes WHERE id = menu_items.cafe_id) as cafe_name
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND (category ILIKE '%bread%' OR name ILIKE '%naan%' OR name ILIKE '%roti%' OR name ILIKE '%paratha%' OR name ILIKE '%kulcha%')
ORDER BY name;
