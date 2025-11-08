-- Add Miranda, Thums Up, Coca Cola, Diet Coke, and Mountain Dew variants to Grabit

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
        (gen_random_uuid(), 'Miranda 750ml', 'Miranda 750ml Bottle', 40, 'DRINKS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/More%20Products/Miranda.webp?updatedAt=1762538927284'),
        (gen_random_uuid(), 'Miranda 250ml', 'Miranda 250ml Bottle', 20, 'DRINKS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/More%20Products/Miranda.webp?updatedAt=1762538927284'),
        (gen_random_uuid(), 'Miranda Can 330ml', 'Miranda Can 330ml', 70, 'DRINKS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/More%20Products/Miranda%20Can.webp?updatedAt=1762538927190'),
        (gen_random_uuid(), 'Thums Up 250ml', 'Thums Up 250ml Bottle', 20, 'DRINKS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/More%20Products/Thums%20Up%20250ml.webp?updatedAt=1762538927297'),
        (gen_random_uuid(), 'Coca Cola Can 330ml', 'Coca Cola Can 330ml', 40, 'DRINKS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/More%20Products/Coca%20Cola%20Can.webp?updatedAt=1762538927180'),
        (gen_random_uuid(), 'Diet Coke Can 300ml', 'Diet Coke Can 300ml', 40, 'DRINKS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/More%20Products/Diet%20Coke%20Can.webp?updatedAt=1762538927049'),
        (gen_random_uuid(), 'Mountain Dew 400ml', 'Mountain Dew 400ml Bottle', 20, 'DRINKS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/More%20Products/Mountain%20Dew%20400ml.webp?updatedAt=1762539075903'),
        (gen_random_uuid(), 'Mountain Dew 750ml', 'Mountain Dew 750ml Bottle', 40, 'DRINKS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/More%20Products/Mountain%20Dew%20400ml.webp?updatedAt=1762538927183')
    ON CONFLICT DO NOTHING;

END $$;

-- Verify
SELECT mi.name, mi.price, mi.image_url
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE (LOWER(c.name) LIKE '%grabit%' OR LOWER(c.slug) = 'grabit')
  AND mi.name IN (
    'Miranda 750ml',
    'Miranda 250ml',
    'Miranda Can 330ml',
    'Thums Up 250ml',
    'Coca Cola Can 330ml',
    'Diet Coke Can 300ml',
    'Mountain Dew 400ml',
    'Mountain Dew 750ml'
  )
ORDER BY mi.name;

