-- Remove specific Lay's flavors from Grabit
-- This script deletes three Lay's items from the Grabit cafe menu
-- Run this in Supabase Dashboard → SQL Editor

DO $$
DECLARE
    grabit_cafe_id UUID;
    deleted_count INTEGER := 0;
BEGIN
    -- Fetch Grabit cafe ID (matches name or slug)
    SELECT id INTO grabit_cafe_id
    FROM public.cafes
    WHERE LOWER(name) LIKE '%grabit%'
       OR LOWER(slug) = 'grabit'
    LIMIT 1;

    IF grabit_cafe_id IS NULL THEN
        RAISE EXCEPTION 'Grabit cafe not found. Please verify the cafe exists.';
    END IF;

    RAISE NOTICE 'Removing selected Lay''s flavors from Grabit (cafe_id=%)', grabit_cafe_id;

    -- Delete Lay's Green Chutney
    DELETE FROM public.menu_items
    WHERE cafe_id = grabit_cafe_id
      AND name ILIKE '%lay%''%green%chutney%';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Lay''s Green Chutney removed (rows deleted = %)', deleted_count;

    -- Delete Lay's Sizzling Barbeque
    DELETE FROM public.menu_items
    WHERE cafe_id = grabit_cafe_id
      AND name ILIKE '%lay%''%sizzling%barbeque%';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Lay''s Sizzling Barbeque removed (rows deleted = %)', deleted_count;

    -- Delete Lay's Sour Cream & Onion
    DELETE FROM public.menu_items
    WHERE cafe_id = grabit_cafe_id
      AND (
        name ILIKE '%lay%''%sour%cream%&%onion%'
        OR name ILIKE '%lay%''%sour%cream%and%onion%'
      );
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Lay''s Sour Cream & Onion removed (rows deleted = %)', deleted_count;

    RAISE NOTICE 'Lay''s flavor removal completed.';
END $$;

-- Verification: Ensure these items no longer exist for Grabit
SELECT mi.name, mi.price
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE (LOWER(c.name) LIKE '%grabit%' OR LOWER(c.slug) = 'grabit')
  AND mi.name ILIKE '%lay%''%'
  AND (
      mi.name ILIKE '%green%chutney%'
   OR mi.name ILIKE '%sizzling%barbeque%'
   OR mi.name ILIKE '%sour%cream%'
  )
ORDER BY mi.name;





