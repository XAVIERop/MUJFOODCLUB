-- Merge all beverage categories into DRINKS category
UPDATE public.menu_items 
SET category = 'DRINKS'
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category IN ('COLDDRINK', 'JUICES', 'ENERGYDRINK', 'MILKDRINK', 'SPARKLINGWATER');

-- Verify the merge
SELECT 
    category,
    COUNT(*) as item_count
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'DRINKS'
GROUP BY category
ORDER BY category;

-- Show all DRINKS items by type
SELECT 
    name,
    price,
    category,
    is_available
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'DRINKS'
ORDER BY name;
