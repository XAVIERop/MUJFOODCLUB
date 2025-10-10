-- Debug Balaji brand filtering
-- Check all items in 24 Seven Mart that should be Balaji brand
SELECT 
    name,
    price,
    category,
    is_available,
    CASE 
        WHEN name ILIKE '%BALAJI%' THEN 'Balaji'
        WHEN name ILIKE '%CRUNCHEX%' THEN 'Balaji' 
        ELSE 'Other'
    END as extracted_brand
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'CHIPS'
ORDER BY name;

-- Check total items in CHIPS category
SELECT 
    COUNT(*) as total_chips_items
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'CHIPS';

-- Check if any items have BALAJI in the name
SELECT 
    COUNT(*) as balaji_items_count
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND (name ILIKE '%BALAJI%' OR name ILIKE '%CRUNCHEX%');
