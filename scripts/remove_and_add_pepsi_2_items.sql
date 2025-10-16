-- Remove all existing Pepsi items first
DELETE FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'COLDDRINK'
  AND name ILIKE 'PEPSI%';

-- Add only the 2 specific Pepsi items
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
-- Only 2 Pepsi items
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'PEPSI', 'Refreshing carbonated cola drink', 20.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'BLACK PEPSI', 'Zero sugar refreshing cola drink', 20.00, 'COLDDRINK', true, NOW(), NOW());

-- Verify only these 2 items exist
SELECT 
    name,
    price,
    category,
    is_available
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'COLDDRINK'
  AND (name = 'PEPSI' OR name = 'BLACK PEPSI')
ORDER BY name;
