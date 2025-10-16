-- Add Milk Drinks (Dairy-based) to 24 Seven Mart cafe
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
-- Milk Drinks (2 items)
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'CREAM BELL KESAR BADAM VANILA', 'Kesar badam vanilla milkshake', 20.00, 'MILKDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'CHOCO-CHOCO', 'Chocolate flavored drink', 30.00, 'MILKDRINK', true, NOW(), NOW());

-- Verify the added Milk Drinks items
SELECT 
    name,
    price,
    category,
    is_available
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'MILKDRINK'
ORDER BY name;
