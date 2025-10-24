-- Add Juices (Fruit Juices) to 24 Seven Mart cafe
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
-- Tropicana (2 items)
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'TROPICANA MIXFURIT', 'Mixed fruit juice', 30.00, 'JUICES', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'TROPICANA GAVAWA', 'Guava juice', 30.00, 'JUICES', true, NOW(), NOW()),

-- Paperboat SWING (8 items)
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'SWING COCONUT WATER', 'Coconut water drink', 20.00, 'JUICES', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'SWING GUAVA', 'Yummy guava juicier drink', 20.00, 'JUICES', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'SWING MIXED FRUIT', 'Mixed fruit medley', 20.00, 'JUICES', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'SWING POMEGRANATE', 'Zesty pomegranate', 20.00, 'JUICES', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'SWING LYCHEE', 'Lush lychees', 20.00, 'JUICES', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'SWING MANGO', 'Sleepy mango', 20.00, 'JUICES', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'SWING LYCHEE PREMIUM', 'Lush lychees premium', 45.00, 'JUICES', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'SWING POMEGRANATE PREMIUM', 'Zesty pomegranate premium', 45.00, 'JUICES', true, NOW(), NOW()),

-- Other Juices (2 items)
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'ORANGE PULPY', 'Orange pulpy drink', 20.00, 'JUICES', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'NUMBOOZ', 'Lemon flavored drink', 20.00, 'JUICES', true, NOW(), NOW());

-- Verify the added Juices items
SELECT 
    name,
    price,
    category,
    is_available
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'JUICES'
ORDER BY name;
