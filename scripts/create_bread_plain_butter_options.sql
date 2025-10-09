-- Create Plain/Butter options for Taste of India bread items
-- Step 1: Check current bread items that need conversion
SELECT 
    id,
    name,
    description,
    price,
    category,
    is_available
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name ILIKE '%plain%'
  AND name ILIKE '%butter%'
ORDER BY name;

-- Step 2: Update existing items to create Plain versions
-- Example: "Laccha Paratha (Plain / Butter)" becomes "Laccha Paratha (Plain)"
UPDATE public.menu_items
SET 
    name = REPLACE(name, ' (Plain / Butter)', ' (Plain)'),
    description = CONCAT(description, ' - Plain version'),
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name ILIKE '%plain%'
  AND name ILIKE '%butter%';

-- Step 3: Create Butter versions for each item
-- This will create duplicate items with (Butter) suffix

-- For Laccha Paratha
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
    REPLACE(name, ' (Plain)', ' (Butter)') as name,
    CONCAT(description, ' - Butter version') as description,
    price,
    category,
    cafe_id,
    preparation_time,
    is_available,
    NOW() as created_at,
    NOW() as updated_at
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name ILIKE '%laccha paratha%'
  AND name ILIKE '%plain%'
  AND name NOT ILIKE '%butter%';

-- For Kulcha Roti
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
    REPLACE(name, ' (Plain)', ' (Butter)') as name,
    CONCAT(description, ' - Butter version') as description,
    price,
    category,
    cafe_id,
    preparation_time,
    is_available,
    NOW() as created_at,
    NOW() as updated_at
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name ILIKE '%kulcha roti%'
  AND name ILIKE '%plain%'
  AND name NOT ILIKE '%butter%';

-- For Naan
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
    REPLACE(name, ' (Plain)', ' (Butter)') as name,
    CONCAT(description, ' - Butter version') as description,
    price,
    category,
    cafe_id,
    preparation_time,
    is_available,
    NOW() as created_at,
    NOW() as updated_at
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name ILIKE '%naan%'
  AND name ILIKE '%plain%'
  AND name NOT ILIKE '%butter%';

-- For Laccha Naan
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
    REPLACE(name, ' (Plain)', ' (Butter)') as name,
    CONCAT(description, ' - Butter version') as description,
    price,
    category,
    cafe_id,
    preparation_time,
    is_available,
    NOW() as created_at,
    NOW() as updated_at
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name ILIKE '%laccha naan%'
  AND name ILIKE '%plain%'
  AND name NOT ILIKE '%butter%';

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
  AND (category ILIKE '%bread%' OR name ILIKE '%naan%' OR name ILIKE '%roti%' OR name ILIKE '%paratha%' OR name ILIKE '%kulcha%')
ORDER BY name;
