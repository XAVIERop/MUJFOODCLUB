-- Add Cornitos chips items to 24 Seven Mart cafe
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
-- Cornitos Tikka Masala
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'CORNITOS TIKKA MASALA', 'Spicy Tikka Masala flavored nachos', 35.00, 'CHIPS', true, NOW(), NOW()),

-- Cornitos Peri Peri
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'CORNITOS PERI PERI', 'Zesty Peri Peri flavored nachos', 35.00, 'CHIPS', true, NOW(), NOW()),

-- Cornitos Thai
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'CORNITOS THAI', 'Exotic Thai flavored nachos', 35.00, 'CHIPS', true, NOW(), NOW()),

-- Cornitos Sea Salt
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'CORNITOS SEA SALT', 'Classic Sea Salt flavored nachos', 35.00, 'CHIPS', true, NOW(), NOW()),

-- Cornitos Jalapeno
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'CORNITOS JALAPENO', 'Spicy Jalapeno flavored nachos', 35.00, 'CHIPS', true, NOW(), NOW()),

-- Cornitos Tomato
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'CORNITOS TOMATO', 'Tangy Tomato flavored nachos', 35.00, 'CHIPS', true, NOW(), NOW()),

-- Cornitos Salsa
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'CORNITOS SALSA', 'Rich Salsa flavored nachos', 70.00, 'CHIPS', true, NOW(), NOW());

-- Verify the added Cornitos items
SELECT 
    name,
    price,
    category,
    is_available
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'CHIPS'
  AND name ILIKE 'CORNITOS%'
ORDER BY name;
