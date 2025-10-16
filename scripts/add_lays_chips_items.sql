-- Add Lays chips items to 24 Seven Mart cafe
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
-- Lays Classic varieties
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'LAYS CLASSIC SALTED', 'Classic salted potato chips', 20.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'LAYS CLASSIC UNSALTED', 'Classic unsalted potato chips', 20.00, 'CHIPS', true, NOW(), NOW()),

-- Lays Flavored varieties
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'LAYS MASALA MONACO', 'Spicy masala flavor', 20.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'LAYS TANGY TOMATO', 'Tangy tomato flavor', 20.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'LAYS CHILLI LIMKA', 'Spicy chilli lime flavor', 20.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'LAYS SPICY TOMATO', 'Spicy tomato flavor', 20.00, 'CHIPS', true, NOW(), NOW()),

-- Lays Special varieties
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'LAYS MAGIC MASALA', 'Magic masala flavor', 20.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'LAYS SPICY TOMATO KETCHUP', 'Spicy tomato ketchup flavor', 20.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'LAYS SPICY TOMATO KETCHUP', 'Spicy tomato ketchup flavor', 20.00, 'CHIPS', true, NOW(), NOW()),

-- Lays Popcorn varieties
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'LAYS POPCORN', 'Light and crispy popcorn', 20.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'LAYS POPCORN BUTTER', 'Butter flavored popcorn', 20.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'LAYS POPCORN CHEESE', 'Cheese flavored popcorn', 20.00, 'CHIPS', true, NOW(), NOW());

-- Verify the added items
SELECT 
    name,
    price,
    category,
    is_available
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'CHIPS'
  AND name ILIKE 'LAYS%'
ORDER BY name;
