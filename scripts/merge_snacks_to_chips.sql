-- Merge SNACKS category into CHIPS category
UPDATE public.menu_items 
SET category = 'CHIPS'
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'SNACKS';

-- Verify the merge
SELECT 
    category,
    COUNT(*) as item_count
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'CHIPS'
GROUP BY category
ORDER BY category;

-- Show all CHIPS items
SELECT 
    name,
    price,
    category,
    is_available
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'CHIPS'
ORDER BY name;
