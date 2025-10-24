-- Update sampler item descriptions with detailed subdescriptions for Taste of India
-- Step 1: Check current sampler items
SELECT 
    id,
    name,
    description,
    price,
    category,
    is_available
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND (name ILIKE '%chinese sampler%' OR name ILIKE '%tandoori%sampler%')
ORDER BY name;

-- Step 2: Update Chinese Sampler Non-Veg description
UPDATE public.menu_items
SET 
    description = 'Assorted non-vegetarian Chinese dishes - Rice/noodle + chilli chicken dry + chilli chicken gravy',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name ILIKE '%chinese sampler%'
  AND name ILIKE '%non%veg%';

-- Step 3: Update Chinese Sampler Veg description
UPDATE public.menu_items
SET 
    description = 'Assorted vegetarian Chinese dishes - Chilli paneer dry + starter + chilli paneer gravy',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name ILIKE '%chinese sampler%'
  AND name ILIKE '%veg%'
  AND name NOT ILIKE '%non%';

-- Step 4: Update Tandoori Chicken Sampler description
UPDATE public.menu_items
SET 
    description = 'Assorted tandoori chicken items - 2pc chicken tikka + 1 naan + 1 roti + 2pc',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name ILIKE '%tandoori%'
  AND name ILIKE '%sampler%';

-- Verification: Check updated descriptions
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
  AND (name ILIKE '%chinese sampler%' OR name ILIKE '%tandoori%sampler%')
ORDER BY name;
