-- Convert bread items with (Plain / Butter) into selectable options
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

-- Step 2: Update existing items to remove (Plain / Butter) from name
-- and create portion variants

-- Example for Laccha Paratha (Plain / Butter)
UPDATE public.menu_items
SET 
    name = 'Laccha Paratha',
    description = 'Layered flatbread - choose your preference',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name ILIKE '%laccha paratha%'
  AND name ILIKE '%plain%'
  AND name ILIKE '%butter%';

-- Step 3: Create portion variants for each bread item
-- This will need to be done for each item individually
-- For now, let's create a template for Laccha Paratha

-- Note: The actual portion variants will need to be created through the frontend
-- or by updating the menu_items table structure to support portions
-- This is a complex change that affects the database schema

-- Verification: Check updated items
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
