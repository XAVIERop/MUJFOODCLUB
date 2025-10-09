-- Fix Chicken Combo to have one card with Bone/Boneless options
-- Step 1: Delete the separate cards we created
DELETE FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND (name = 'Chicken Combo (Bone)' OR name = 'Chicken Combo (Boneless)');

-- Step 2: Create the proper format with suffixes that will be grouped by frontend
-- Create Bone version
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
) VALUES (
    'Chicken Combo (Bone)',
    'Chicken dish with accompaniments',
    190,
    'Combo Meals',
    (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%'),
    15,
    true,
    NOW(),
    NOW()
);

-- Create Boneless version
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
) VALUES (
    'Chicken Combo (Boneless)',
    'Chicken dish with accompaniments',
    230,
    'Combo Meals',
    (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%'),
    15,
    true,
    NOW(),
    NOW()
);

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
