-- Add Energy Drinks to 24 Seven Mart cafe
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
-- Energy Drinks (2 items)
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'PREDATOR', 'Energy drink (330ml)', 60.00, 'ENERGYDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'MONSTER WHITE ULTRA', 'Monster energy drink white ultra', 125.00, 'ENERGYDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'MONSTER GREEN', 'Monster energy drink green', 125.00, 'ENERGYDRINK', true, NOW(), NOW());

-- Verify the added Energy Drinks items
SELECT 
    name,
    price,
    category,
    is_available
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'ENERGYDRINK'
ORDER BY name;
