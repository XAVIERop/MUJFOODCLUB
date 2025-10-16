-- Fix ACT2 ACT2 duplicates
UPDATE public.menu_items 
SET name = REPLACE(name, 'ACT2 ACT2 ', 'ACT2 ')
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND name ILIKE 'ACT2 ACT2 %';

-- Verify the fix
SELECT 
    name,
    price,
    category
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'CHIPS'
  AND name ILIKE 'ACT2%'
ORDER BY name;
