-- Remove specific Lay's flavours from Grabit
-- Flavours: Sizzling Barbeque, Sour Cream & Onion

DO $$
DECLARE
    grabit_cafe_id UUID;
    deleted_barbecue INTEGER := 0;
    deleted_sourcream INTEGER := 0;
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
      AND name ILIKE '%lay%''%sizzling%barbeque%';
    GET DIAGNOSTICS deleted_barbecue = ROW_COUNT;
    RAISE NOTICE 'Lay''s Sizzling Barbeque removed (rows deleted = %)', deleted_barbecue;

    DELETE FROM public.menu_items
    WHERE cafe_id = grabit_cafe_id
      AND (
        name ILIKE '%lay%''%sour%cream%&%onion%'
        OR name ILIKE '%lay%''%sour%cream%and%onion%'
      );
    GET DIAGNOSTICS deleted_sourcream = ROW_COUNT;
    RAISE NOTICE 'Lay''s Sour Cream & Onion removed (rows deleted = %)', deleted_sourcream;

END $$;

-- Verify removal
SELECT mi.name, mi.price
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE (LOWER(c.name) LIKE '%grabit%' OR LOWER(c.slug) = 'grabit')
  AND mi.name ILIKE '%lay%''%'
  AND (
      mi.name ILIKE '%sizzling%barbeque%'
   OR mi.name ILIKE '%sour%cream%'
  )
ORDER BY mi.name;





