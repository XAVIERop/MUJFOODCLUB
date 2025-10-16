-- Add Cold Drinks (Carbonated/Soft Drinks) to 24 Seven Mart cafe
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
-- Pepsi Company (8 items)
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'PEPSI', 'Refreshing carbonated cola drink', 20.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'BLACK PEPSI', 'Zero sugar refreshing cola drink', 20.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'MIRINDA', 'Orange flavored carbonated drink (250ml)', 20.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'MIRINDA (LARGE)', 'Orange flavored carbonated drink (750ml)', 40.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'DEW', 'Citrus flavored carbonated drink (250ml)', 20.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'DEW (LARGE)', 'Citrus flavored carbonated drink (750ml)', 40.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'SLICE', 'Mango flavored drink (250ml)', 20.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'SLICE (LARGE)', 'Mango flavored drink (750ml)', 40.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), '7UP', 'Lemon-lime flavored carbonated drink', 20.00, 'COLDDRINK', true, NOW(), NOW()),

-- Coca-Cola Company (10 items)
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'COKE', 'Classic cola drink (250ml)', 20.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'COKE (LARGE)', 'Classic cola drink (750ml)', 40.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'DIET COKE', 'Zero sugar cola drink (300ml)', 40.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'THUMS UP', 'Strong cola drink (250ml)', 20.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'THUMS UP (LARGE)', 'Strong cola drink (750ml)', 40.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'THUMS UP (300ML)', 'Strong cola drink (300ml)', 40.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'LIMCA', 'Lemon-lime flavored drink (250ml)', 20.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'FANTA', 'Orange flavored drink (750ml)', 40.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'FANTA (300ML)', 'Orange flavored drink (300ml)', 40.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'SPRITE', 'Lemon-lime flavored drink (250ml)', 20.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'SPRITE (LARGE)', 'Lemon-lime flavored drink (750ml)', 40.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'SPRITE (300ML)', 'Lemon-lime flavored drink (300ml)', 40.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'MAZZA', 'Mango flavored drink (250ml)', 20.00, 'COLDDRINK', true, NOW(), NOW()),
((SELECT id FROM public.cafes WHERE name = '24 Seven Mart'), 'MAZZA (LARGE)', 'Mango flavored drink (750ml)', 40.00, 'COLDDRINK', true, NOW(), NOW());

-- Verify the added Cold Drinks items
SELECT 
    name,
    price,
    category,
    is_available
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'COLDDRINK'
ORDER BY name;
