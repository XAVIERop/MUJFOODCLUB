-- Remove all existing Pepsi company items first
DELETE FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'COLDDRINK'
  AND (
    name ILIKE 'PEPSI%' OR 
    name ILIKE 'BLACK PEPSI%' OR
    name ILIKE 'TROPICANA%' OR
    name ILIKE 'MIRINDA%' OR
    name ILIKE 'NUMBOOZ%' OR
    name ILIKE 'DEW%' OR
    name ILIKE 'SLICE%' OR
    name ILIKE '7UP%'
  );

-- Add all Pepsi company items
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
-- Pepsi varieties
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'PEPSI', 'Refreshing carbonated cola drink', 20.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'BLACK PEPSI', 'Zero sugar refreshing cola drink', 20.00, 'COLDDRINK', true, NOW(), NOW()),

-- Tropicana varieties
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'TROPICANA MIXFURIT', 'Mixed fruit juice', 30.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'TROPICANA GAVAWA', 'Guava juice', 30.00, 'COLDDRINK', true, NOW(), NOW()),

-- Mirinda varieties
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'MIRINDA', 'Orange flavored carbonated drink (200ml)', 20.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'MIRINDA (LARGE)', 'Orange flavored carbonated drink (600ml)', 40.00, 'COLDDRINK', true, NOW(), NOW()),

-- Numbbooz
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'NUMBOOZ', 'Lemon flavored drink', 20.00, 'COLDDRINK', true, NOW(), NOW()),

-- Dew varieties
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'DEW', 'Citrus flavored carbonated drink (250ml)', 20.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'DEW (LARGE)', 'Citrus flavored carbonated drink (600ml)', 40.00, 'COLDDRINK', true, NOW(), NOW()),

-- Slice varieties
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'SLICE', 'Mango flavored drink (250ml)', 20.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'SLICE (LARGE)', 'Mango flavored drink (600ml)', 40.00, 'COLDDRINK', true, NOW(), NOW()),

-- 7UP
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), '7UP', 'Lemon-lime flavored carbonated drink', 20.00, 'COLDDRINK', true, NOW(), NOW());

-- Verify the added Pepsi company items
SELECT 
    name,
    price,
    category,
    is_available
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'COLDDRINK'
  AND (
    name ILIKE 'PEPSI%' OR 
    name ILIKE 'BLACK PEPSI%' OR
    name ILIKE 'TROPICANA%' OR
    name ILIKE 'MIRINDA%' OR
    name ILIKE 'NUMBOOZ%' OR
    name ILIKE 'DEW%' OR
    name ILIKE 'SLICE%' OR
    name ILIKE '7UP%'
  )
ORDER BY name;
