-- Update Cornitos Jalapeno price to ₹35 for Grabit (or any matching cafe)

DO $$
DECLARE
    grabit_cafe_id UUID;
BEGIN
    SELECT id INTO grabit_cafe_id
    FROM public.cafes
    WHERE LOWER(name) LIKE '%grabit%'
       OR LOWER(slug) = 'grabit'
    LIMIT 1;

    IF grabit_cafe_id IS NULL THEN
        RAISE EXCEPTION 'Grabit cafe not found.';
    END IF;

    UPDATE public.menu_items
    SET price = 35,
        updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id
      AND name ILIKE '%cornitos%'
      AND name ILIKE '%jalapeno%';

END $$;

-- Verify price
SELECT mi.name, mi.price
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE (LOWER(c.name) LIKE '%grabit%' OR LOWER(c.slug) = 'grabit')
  AND mi.name ILIKE '%cornitos%'
  AND mi.name ILIKE '%jalapeno%';

