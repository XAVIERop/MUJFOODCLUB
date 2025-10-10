-- Remove all chips items from 24 Seven Mart cafe
DELETE FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'CHIPS';

-- Verify all chips items are removed
SELECT 
    name,
    price,
    category
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'CHIPS';

-- Show remaining items in 24 Seven Mart
SELECT 
    category,
    COUNT(*) as item_count
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
GROUP BY category
ORDER BY category;
