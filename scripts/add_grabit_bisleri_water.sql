-- Add Bisleri water items for Grabit with provided ImageKit URLs

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

    INSERT INTO public.menu_items (id, name, description, price, category, is_available, out_of_stock, preparation_time, cafe_id, image_url)
    VALUES
        (gen_random_uuid(), 'Bisleri 1L', 'Bisleri Packaged Drinking Water 1L', 20, 'DRINKS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/More%20Products/Bisleri%201L.jpeg?updatedAt=1762538926821'),
        (gen_random_uuid(), 'Bisleri 2L', 'Bisleri Packaged Drinking Water 2L', 30, 'DRINKS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/More%20Products/Bisleri%202L.avif?updatedAt=1762538927073')
    ON CONFLICT DO NOTHING;

END $$;

-- Verification
SELECT mi.name, mi.price, mi.image_url
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE (LOWER(c.name) LIKE '%grabit%' OR LOWER(c.slug) = 'grabit')
  AND mi.name LIKE 'Bisleri%';



