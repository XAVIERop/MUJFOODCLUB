-- Check Balaji items in 24 Seven Mart
SELECT 
    name,
    price,
    category,
    is_available,
    out_of_stock
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND (name ILIKE '%balaji%' OR name ILIKE '%crunchx%')
ORDER BY name;

-- Also check if 24 Seven Mart cafe exists
SELECT 
    id,
    name,
    accepting_orders,
    is_active
FROM public.cafes 
WHERE name = '24 Seven Mart';
