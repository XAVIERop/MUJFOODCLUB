-- Add Crax chips items to 24 Seven Mart cafe
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
-- Crax Natkhat varieties
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'CRAX NATKHAT CLASSIC', 'Classic crunchy snack', 20.00, 'CHIPS', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'CRAX NATKHAT MASALA', 'Spicy masala crunchy snack', 20.00, 'CHIPS', true, NOW(), NOW()),

-- Crax Carls variety
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'CRAX CARLS CHATPATA MASALA', 'Tangy chatpata masala snack', 20.00, 'CHIPS', true, NOW(), NOW()),

-- Crax Chees Balls
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'CRAX CHEES BALLS', 'Delicious cheesy balls snack', 20.00, 'CHIPS', true, NOW(), NOW());

-- Verify the added Crax items
SELECT 
    name,
    price,
    category,
    is_available
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'CHIPS'
  AND name ILIKE 'CRAX%'
ORDER BY name;
