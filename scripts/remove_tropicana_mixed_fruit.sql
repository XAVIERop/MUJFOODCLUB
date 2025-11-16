-- Remove Tropicana Mixed Fruit items from Grabit (or any specified cafe)
-- Run in Supabase SQL editor

DO $$
DECLARE
    grabit_cafe_id UUID;
    deleted_count INTEGER := 0;
BEGIN
    SELECT id INTO grabit_cafe_id
    FROM public.cafes
    WHERE LOWER(name) LIKE '%grabit%'
       OR LOWER(slug) = 'grabit'
    LIMIT 1;

    IF grabit_cafe_id IS NULL THEN
        RAISE EXCEPTION 'Grabit cafe not found.';
    END IF;

    DELETE FROM public.menu_items
    WHERE cafe_id = grabit_cafe_id
      AND name ILIKE '%tropicana%mixed%fruit%';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Tropicana Mixed Fruit items removed: %', deleted_count;
END $$;

-- Verify deletion
SELECT mi.name, mi.price
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE (LOWER(c.name) LIKE '%grabit%' OR LOWER(c.slug) = 'grabit')
  AND mi.name ILIKE '%tropicana%mixed%fruit%';



