-- Add Balaji chips items to 24 Seven Mart cafe
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
-- Balaji RUMBLES
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'BALAJI RUMBLES', 'Crunchy wafers with perfect texture', 40.00, 'CHIPS', true, NOW(), NOW()),

-- Balaji CRUNCHEX items
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'BALAJI CRUNCHEX SIMPLY SALTED', 'Simply salted crunchy chips', 40.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'BALAJI CRUNCHEX CHILLI TADKA', 'Spicy chilli tadka flavor', 40.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'BALAJI CRUNCHEX TOMATO TWIST', 'Tangy tomato twist flavor', 40.00, 'CHIPS', true, NOW(), NOW()),

-- Balaji CRUNCHEM items
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'BALAJI CRUNCHEM MASALA MASTI', 'Spicy masala masti flavor', 40.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'BALAJI CRUNCHEM CREAM ONION', 'Creamy onion flavor', 40.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'BALAJI CRUNCHEM CHAAT CHASKA', 'Tangy chaat chaska flavor', 40.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'BALAJI CRUNCHEM SIMPLY SALTED', 'Simply salted crunchy chips', 40.00, 'CHIPS', true, NOW(), NOW());

-- Verify the added items
SELECT 
    name,
    price,
    category,
    is_available
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'CHIPS'
  AND name ILIKE 'BALAJI%'
ORDER BY name;
