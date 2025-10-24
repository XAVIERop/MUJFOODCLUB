-- Change 'Mutter Milk' to 'Butter Milk' for Taste of India cafe
UPDATE public.menu_items
SET
    name = 'Butter Milk',
    description = 'Traditional butter milk',
    updated_at = NOW()
WHERE
    cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
    AND name = 'Mutter Milk';

-- Verification query
SELECT
    id,
    name,
    description,
    price,
    category,
    is_available,
    (SELECT name FROM public.cafes WHERE id = menu_items.cafe_id) as cafe_name
FROM public.menu_items
WHERE
    cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
    AND name = 'Butter Milk';
