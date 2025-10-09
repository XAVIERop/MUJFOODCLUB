-- Create Rice/Bread options for Dal Combo in Taste of India
-- Step 1: Check current Dal Combo item
SELECT 
    id,
    name,
    description,
    price,
    category,
    is_available
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name ILIKE '%dal combo%'
  AND name ILIKE '%rice%'
  AND name ILIKE '%bread%';

-- Step 2: Update existing item to create Rice version
UPDATE public.menu_items
SET 
    name = 'Dal Combo (Rice)',
    description = 'Dal with rice accompaniments',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name ILIKE '%dal combo%'
  AND name ILIKE '%rice%'
  AND name ILIKE '%bread%';

-- Step 3: Create Bread version
INSERT INTO public.menu_items (
    name,
    description,
    price,
    category,
    cafe_id,
    preparation_time,
    is_available,
    created_at,
    updated_at
)
SELECT 
    'Dal Combo (Bread)' as name,
    'Dal with bread accompaniments' as description,
    price,
    category,
    cafe_id,
    preparation_time,
    is_available,
    NOW() as created_at,
    NOW() as updated_at
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Dal Combo (Rice)';

-- Verification: Check final result
SELECT 
    id,
    name,
    description,
    price,
    category,
    is_available,
    (SELECT name FROM public.cafes WHERE id = menu_items.cafe_id) as cafe_name
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name ILIKE '%dal combo%'
ORDER BY name;
