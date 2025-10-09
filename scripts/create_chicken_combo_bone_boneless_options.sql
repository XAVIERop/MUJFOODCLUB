-- Create Bone/Boneless options for Chicken Combo in Taste of India
-- Step 1: Check current Chicken Combo item
SELECT 
    id,
    name,
    description,
    price,
    category,
    is_available
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name ILIKE '%chicken combo%'
  AND name ILIKE '%bone%'
  AND name ILIKE '%boneless%';

-- Step 2: Update existing item to create Bone version
UPDATE public.menu_items
SET 
    name = 'Chicken Combo (Bone)',
    description = 'Chicken dish with accompaniments - Bone version',
    price = 190,
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name ILIKE '%chicken combo%'
  AND name ILIKE '%bone%'
  AND name ILIKE '%boneless%';

-- Step 3: Create Boneless version
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
    'Chicken Combo (Boneless)' as name,
    'Chicken dish with accompaniments - Boneless version' as description,
    230 as price,
    category,
    cafe_id,
    preparation_time,
    is_available,
    NOW() as created_at,
    NOW() as updated_at
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Chicken Combo (Bone)';

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
  AND name ILIKE '%chicken combo%'
ORDER BY name;
