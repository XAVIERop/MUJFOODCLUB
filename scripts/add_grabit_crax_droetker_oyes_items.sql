-- Add Crax chips, Dr. Oetker cakes, and Oyes chips for Grabit with provided images

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
        (gen_random_uuid(), 'Crax Nattkat Classic', 'Crax Nattkat Classic', 25, 'CHIPS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chips/Crax/Crax%20Nathkat%20Classic.webp?updatedAt=1762543704377'),
        (gen_random_uuid(), 'Crax Cheese Balls', 'Crax Cheese Balls', 20, 'CHIPS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chips/Crax/Crax%20Cheese%20Balls.webp?updatedAt=1762543703453'),
        (gen_random_uuid(), 'Crax Rings Tangy Tomato', 'Crax Rings Tangy Tomato', 20, 'CHIPS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chips/Crax/Crax%20Rings%20Tangy%20Tomato.webp?updatedAt=1762543704284'),
        (gen_random_uuid(), 'Supreme Brownie Bar', 'Dr. Oetker Supreme Brownie Bar', 79, 'CAKE', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Cakes/Supreme%20Brownie%20Bar.webp?updatedAt=1762544465438'),
        (gen_random_uuid(), 'Fruit & Nut Cake', 'Dr. Oetker Fruit & Nut Cake', 53, 'CAKE', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Cakes/Fruit%20&%20Nut%20Cake.webp?updatedAt=1762544465370'),
        (gen_random_uuid(), 'Marble Cake', 'Dr. Oetker Marble Cake', 53, 'CAKE', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Cakes/Marble%20Cake.webp?updatedAt=1762544465235'),
        (gen_random_uuid(), 'Butter Almond Cake', 'Dr. Oetker Butter Almond Cake', 59, 'CAKE', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Cakes/Butter%20Almond%20Cake.webp?updatedAt=1762544465229'),
        (gen_random_uuid(), 'Red Velvet Brownie 37g', 'Dr. Oetker Red Velvet Brownie 37g', 13, 'CAKE', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Cakes/Red%20Velvet%20Brownie.webp?updatedAt=1762544465493'),
        (gen_random_uuid(), 'Dark Choco Chip Brownie 37g', 'Dr. Oetker Dark Choco Chip Brownie 37g', 13, 'CAKE', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Cakes/Dark%20Choco%20Chip%20Brownie.webp?updatedAt=1762544465134'),
        (gen_random_uuid(), 'Confetti Brownie 37g', 'Dr. Oetker Confetti Brownie 37g', 13, 'CAKE', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Cakes/Confetti%20Brownie.webp?updatedAt=1762544465467'),
        (gen_random_uuid(), 'Oyes Khatta Meetha', 'Oyes Khatta Meetha', 30, 'CHIPS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chips/Oyes/khatta%20meetha.webp?updatedAt=1762544572042'),
        (gen_random_uuid(), 'Oyes Cocktail', 'Oyes Cocktail', 30, 'CHIPS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chips/Oyes/Cocktail.webp?updatedAt=1762544572357'),
        (gen_random_uuid(), 'Oyes Tangy Pudhina', 'Oyes Tangy Pudhina', 30, 'CHIPS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chips/Oyes/Tangy%20Pudhina.webp?updatedAt=1762544572318')
    ON CONFLICT DO NOTHING;

END $$;

-- Verify inserts
SELECT mi.name, mi.price, mi.category, mi.image_url
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE (LOWER(c.name) LIKE '%grabit%' OR LOWER(c.slug) = 'grabit')
  AND mi.name IN (
    'Crax Nattkat Classic',
    'Crax Cheese Balls',
    'Crax Rings Tangy Tomato',
    'Supreme Brownie Bar',
    'Fruit & Nut Cake',
    'Marble Cake',
    'Butter Almond Cake',
    'Red Velvet Brownie 37g',
    'Dark Choco Chip Brownie 37g',
    'Confetti Brownie 37g',
    'Oyes Khatta Meetha',
    'Oyes Cocktail',
    'Oyes Tangy Pudhina'
  )
ORDER BY mi.name;

