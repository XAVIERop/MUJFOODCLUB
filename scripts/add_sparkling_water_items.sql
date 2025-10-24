-- Add Sparkling Water to 24 Seven Mart cafe
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
-- Sparkling Water (2 items)
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'ZERO LEMON LIME', 'Sparkling water lemon lime flavored', 20.00, 'SPARKLINGWATER', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'ZERO GREEN APPLE', 'Sparkling water green apple flavored', 20.00, 'SPARKLINGWATER', true, NOW(), NOW());
-- Verify the added Sparkling Water items
SELECT 
    name,
    price,
    category,
    is_available
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'SPARKLINGWATER'
ORDER BY name;
