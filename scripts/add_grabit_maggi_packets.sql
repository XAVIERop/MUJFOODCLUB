-- Add Maggi packet items to Grabit with specified ImageKit URLs

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
        (gen_random_uuid(), 'Maggi 2 Minute Noodles Masala 4 Pack 280g', 'Maggi 2 Minute Noodles Masala 4 Pack (280g)', 60, 'INSTANTFOOD', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/2%20Minute%20Noodles%20Masala%204%20Pack.webp?updatedAt=1762545809427'),
        (gen_random_uuid(), 'Maggi 2 Minute Noodles Masala 140g', 'Maggi 2 Minute Noodles Masala (140g)', 30, 'INSTANTFOOD', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/2%20Minute%20Noodles%20Masala%204%20Pack.webp?updatedAt=1762545645089'),
        (gen_random_uuid(), 'Maggi Veg Atta Noodles Masala 4 Pack 290g', 'Maggi Veg Atta Noodles Masala 4 Pack (290g)', 116, 'INSTANTFOOD', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/Veg%20Atta%20Noodles%20Masala%204%20Pack.webp?updatedAt=1762545645094')
    ON CONFLICT DO NOTHING;

END $$;

-- Verify
SELECT mi.name, mi.price, mi.category, mi.image_url
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE (LOWER(c.name) LIKE '%grabit%' OR LOWER(c.slug) = 'grabit')
  AND mi.name ILIKE 'Maggi%';





