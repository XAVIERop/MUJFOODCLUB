-- Remove all cold drink items from 24 Seven Mart cafe
DELETE FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'COLDDRINK';

-- Verify all cold drink items are removed
SELECT 
    name,
    price,
    category
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'COLDDRINK';

-- Show remaining items in 24 Seven Mart by category
SELECT 
    category,
    COUNT(*) as item_count
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
GROUP BY category
ORDER BY category;
