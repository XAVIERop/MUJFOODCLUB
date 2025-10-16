-- Add Pepsi company cold drink items to 24 Seven Mart cafe
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
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'PEPSI PEPSI', 'Refreshing carbonated cola drink', 20.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'PEPSI BLACK PEPSI', 'Zero sugar refreshing cola drink', 20.00, 'COLDDRINK', true, NOW(), NOW()),

-- Other PepsiCo carbonated drinks
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'PEPSI MOUNTAIN DEW', 'Citrus flavored carbonated drink', 20.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'PEPSI MIRINDA', 'Orange flavored carbonated drink', 20.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'PEPSI 7 UP', 'Lemon-lime flavored carbonated drink', 20.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'PEPSI STING', 'Energy drink', 30.00, 'COLDDRINK', true, NOW(), NOW());

-- Verify the added Pepsi company items
SELECT 
    name,
    price,
    category,
    is_available
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'COLDDRINK'
  AND name ILIKE 'PEPSI%'
ORDER BY name;
