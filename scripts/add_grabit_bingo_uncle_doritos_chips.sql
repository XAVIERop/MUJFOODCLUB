-- Add Bingo, Uncle Chips, and Doritos items for Grabit with ImageKit URLs

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
        (gen_random_uuid(), 'Bingo Mad Angles Achari Masti 44g', 'Bingo Mad Angles Achari Masti 44g', 30, 'CHIPS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chips/Bingo/Bingo%20Mad%20Angles%20Achari%20Masti%2044g.avif?updatedAt=1762541138976'),
        (gen_random_uuid(), 'Bingo Mad Angles Achari Masti 117g', 'Bingo Mad Angles Achari Masti 117g', 50, 'CHIPS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chips/Bingo/Bingo%20Mad%20Angles%20Achari%20Masti%20117g.jpeg?updatedAt=1762541138768'),
        (gen_random_uuid(), 'Bingo Nachos Chilli Lemon', 'Bingo Nachos Chilli Lemon', 20, 'CHIPS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chips/Bingo/Bingo%20Nachos%20Chilli%20Lemon.webp?updatedAt=1762541138722'),
        (gen_random_uuid(), 'Uncle Chips Plain Salted', 'Uncle Chips Plain Salted', 20, 'CHIPS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chips/Uncle%20Chips/Plain%20Salted.webp?updatedAt=1762543283553'),
        (gen_random_uuid(), 'Uncle Chips Spicy Treat', 'Uncle Chips Spicy Treat', 20, 'CHIPS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chips/Uncle%20Chips/Spicy%20Treat.webp?updatedAt=1762543283539'),
        (gen_random_uuid(), 'Doritos Sweet Chilli', 'Doritos Sweet Chilli', 20, 'CHIPS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chips/Doritos/Sweet%20Chilli.webp?updatedAt=1762541151152'),
        (gen_random_uuid(), 'Doritos Naacho Cheese', 'Doritos Naacho Cheese', 20, 'CHIPS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chips/Doritos/Naacho%20Cheese.webp?updatedAt=1762541203043')
    ON CONFLICT DO NOTHING;

END $$;

-- Verify entries
SELECT mi.name, mi.price, mi.image_url
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE (LOWER(c.name) LIKE '%grabit%' OR LOWER(c.slug) = 'grabit')
  AND mi.name IN (
    'Bingo Mad Angles Achari Masti 44g',
    'Bingo Mad Angles Achari Masti 117g',
    'Bingo Nachos Chilli Lemon',
    'Uncle Chips Plain Salted',
    'Uncle Chips Spicy Treat',
    'Doritos Sweet Chilli',
    'Doritos Naacho Cheese'
  )
ORDER BY mi.name;





