-- Add ACT2 chips items to 24 Seven Mart cafe
INSERT INTO public.menu_items (
    cafe_id,
    name,
    description,
    price,
    category,
    is_available,
    created_at,
    updated_at
) VALUES 
-- ACT2 Popcorn varieties
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'ACT2 SPICY PUDINA POPCORN', 'Spicy pudina flavored popcorn', 25.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'ACT2 BUTTER POPCORN', 'Butter flavored popcorn', 25.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'ACT2 SALTED POPCORN', 'Salted popcorn', 25.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'ACT2 TOMATO CHILLI POPCORN', 'Spicy tomato chilli popcorn', 25.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'ACT2 CHEESE BURST POPCORN', 'Cheese burst flavored popcorn', 25.00, 'CHIPS', true, NOW(), NOW());

-- Verify the added ACT2 items
SELECT 
    name,
    price,
    category,
    is_available
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'CHIPS'
  AND name ILIKE 'ACT2%'
ORDER BY name;
