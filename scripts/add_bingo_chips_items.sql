-- Add Bingo chips items to 24 Seven Mart cafe
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
-- Bingo Mad Angles varieties
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'BINGO MAD ANGLES RED ALERT', 'Spicy red alert flavor', 20.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'BINGO MAD ANGLES ACHARI MASTI', 'Tangy achari masti flavor', 20.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'BINGO MAD ANGLES MM MASALA', 'Mixed masala flavor', 20.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'BINGO MAD ANGLES CHAT MASTI', 'Savory chat masti flavor', 20.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'BINGO MAD ANGLES TOMATO MADNESS', 'Intense tomato flavor', 20.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'BINGO MAD ANGLES VERY PERI PERI', 'Spicy peri peri seasoning', 20.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'BINGO MAD ANGLES PIZZA AAAAH', 'Delicious pizza flavor', 20.00, 'CHIPS', true, NOW(), NOW()),

-- Bingo Nachos varieties
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'BINGO NACHOS CHILLI LEMON', 'Spicy chilli and tangy lemon nachos', 20.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'BINGO NACHOS CHEES NACHOS', 'Classic cheesy nachos', 20.00, 'CHIPS', true, NOW(), NOW()),

-- Bingo Tadhe-Madhe
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'BINGO TADHE-MADHE', 'Unique tadhe-madhe snack', 20.00, 'CHIPS', true, NOW(), NOW());

-- Verify the added Bingo items
SELECT 
    name,
    price,
    category,
    is_available
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'CHIPS'
  AND name ILIKE 'BINGO%'
ORDER BY name;
