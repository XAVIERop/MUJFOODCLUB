-- Fix ACT2 CRUNCHEX SIMPLY SALTED to BALAJI CRUNCHEX SIMPLY SALTED
UPDATE public.menu_items 
SET name = 'BALAJI CRUNCHEX SIMPLY SALTED'
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND name = 'ACT2 CRUNCHEX SIMPLY SALTED';

-- Verify the fix
SELECT 
    name,
    price,
    category
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'CHIPS'
  AND (name ILIKE '%CRUNCHEX%' OR name ILIKE '%ACT2%')
ORDER BY name;
