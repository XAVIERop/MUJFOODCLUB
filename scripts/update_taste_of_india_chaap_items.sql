-- Update Taste of India Chaap items
-- Step 1: Split "Malai Chaap / Masala Malai Chaap" into two separate items

-- First, get the current item details
SELECT 
    id,
    name,
    description,
    price,
    category,
    cafe_id,
    (SELECT name FROM public.cafes WHERE id = menu_items.cafe_id) as cafe_name
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name ILIKE '%malai chaap%'
  AND name ILIKE '%masala%';

-- Step 2: Update the existing "Malai Chaap / Masala Malai Chaap" to just "Malai Chaap"
UPDATE public.menu_items
SET 
    name = 'Malai Chaap',
    description = 'Creamy malai chaap',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name ILIKE '%malai chaap%'
  AND name ILIKE '%masala%';

-- Step 3: Create new "Masala Malai Chaap" item
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
    'Masala Malai Chaap',
    'Spiced malai chaap',
    170, -- Same price as original
    'Chaap Starters',
    (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%'),
    15,
    true,
    NOW(),
    NOW()
);

-- Step 4: Rename "Achari Chaap / Haryali Chaap" to "Achari Chaap"
UPDATE public.menu_items
SET 
    name = 'Achari Chaap',
    description = 'Pickle-flavored chaap',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name ILIKE '%achari chaap%'
  AND name ILIKE '%haryali%';

-- Step 5: Delete "Malai Cheese / Masala Cheese Chaap"
DELETE FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name ILIKE '%malai cheese%'
  AND name ILIKE '%masala cheese%';

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
  AND category ILIKE '%chaap%'
ORDER BY name;
