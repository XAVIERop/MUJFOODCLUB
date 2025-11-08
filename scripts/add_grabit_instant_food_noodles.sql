-- Add assorted instant cup/bowl noodle items to Grabit (Instant Food category)
-- Run after ensuring Grabit cafe exists

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
        RAISE EXCEPTION 'Grabit cafe not found. Please create it first.';
    END IF;

    INSERT INTO public.menu_items (id, name, description, price, category, is_available, out_of_stock, preparation_time, cafe_id, image_url)
    VALUES
        (gen_random_uuid(), 'Nissin Rich Seafood Curry Cup Noodles', 'Nissin Cup Noodles Rich Seafood Curry', 55, 'INSTANTFOOD', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/Nissin%20Cup%20Noodles%20Rich%20Seafood%20Curry.webp?updatedAt=1762539794911'),
        (gen_random_uuid(), 'Nissin Cup Noodles Spicy Chunky Chicken', 'Nissin Cup Noodles Spicy Chunky Chicken', 55, 'INSTANTFOOD', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/Nissin%20Cup%20Noodles%20Spicy%20Chunky%20Chicken.webp?updatedAt=1762539794933'),
        (gen_random_uuid(), 'Nissin Cup Noodles Chilli Super Hot', 'Nissin Cup Noodles Chilli Super Hot', 55, 'INSTANTFOOD', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/Nissin%20Cup%20Noodles%20Chilli%20Super%20Hot.webp?updatedAt=1762539795067'),
        (gen_random_uuid(), 'Geki Kimchi SHIN', 'Geki Kimchi SHIN Noodle Cup', 139, 'INSTANTFOOD', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/Geki%20Kimchi%20SHIN.webp?updatedAt=1762539794943'),
        (gen_random_uuid(), 'Geki Korean Kimchi Hot & Spicy', 'Geki Korean Kimchi Hot & Spicy Cup Noodles', 89, 'INSTANTFOOD', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/Geki%20Korean%20Kimchi%20Hot%20%26%20Spicy.webp?updatedAt=1762539795075'),
        (gen_random_uuid(), 'Geki Korean Chicken', 'Geki Korean Chicken Cup Noodles', 89, 'INSTANTFOOD', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/Geki%20Korean%20Chicken.webp?updatedAt=1762539794906'),
        (gen_random_uuid(), 'Geki Veg Korean', 'Geki Veg Korean Cup Noodles', 89, 'INSTANTFOOD', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/Geki%20Veg%20Korean.webp?updatedAt=1762539794809'),
        (gen_random_uuid(), 'Samyang Spicy 2X Buldak Hot Chicken Flavour Ramen Cup', 'Samyang Spicy 2X Buldak Hot Chicken Flavour Ramen Cup', 140, 'INSTANTFOOD', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/Samyang%20Spicy%202X%20Buldak%20Hot%20Chicken%20Flavor%20Ramen%20Cup%20Noodles.jpg?updatedAt=1762539794872'),
        (gen_random_uuid(), 'NongShim Kimchi SHIN Veg 100g', 'NongShim Kimchi SHIN Veg 100g Bowl Noodles', 180, 'INSTANTFOOD', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/NongShin/Kimchi%20SHIN%20Veg%20100g.webp?updatedAt=1762539794630'),
        (gen_random_uuid(), 'NongShim Bowl Noodle Soup Hot & Spicy', 'NongShim Bowl Noodle Soup Hot & Spicy', 180, 'INSTANTFOOD', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/NongShin/NongShim%20Bowl%20Noodle%20Soup%20Hot%20%26%20Spicy.jpg?updatedAt=1762539794518'),
        (gen_random_uuid(), 'NongShim Bowl Noodle Soup Spicy Chicken', 'NongShim Bowl Noodle Soup Spicy Chicken', 180, 'INSTANTFOOD', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/NongShin/NongShim%20Bowl%20Noodle%20Soup%20Spicy%20Chicken.jpg?updatedAt=1762539794884'),
        (gen_random_uuid(), 'Lay''s American Style Cream & Onion', 'Lay''s American Style Cream & Onion Chips', 20, 'CHIPS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chips/American%20Style%20Cream%20%26%20Onion.webp?updatedAt=1762539852910'),
        (gen_random_uuid(), 'Lay''s Sizlin'' Hot', 'Lay''s Sizlin'' Hot Chips', 20, 'CHIPS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chips/Sizzlin%20Hot.jpg?updatedAt=1762539852797')
    ON CONFLICT DO NOTHING;

END $$;

-- Verification query
SELECT mi.name, mi.price, mi.category
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE (LOWER(c.name) LIKE '%grabit%' OR LOWER(c.slug) = 'grabit')
  AND mi.name IN (
    'Nissin Rich Seafood Curry Cup Noodles',
    'Nissin Cup Noodles Spicy Chunky Chicken',
    'Nissin Cup Noodles Chilli Super Hot',
    'Geki Kimchi SHIN',
    'Geki Korean Kimchi Hot & Spicy',
    'Geki Korean Chicken',
    'Geki Veg Korean',
    'Samyang Spicy 2X Buldak Hot Chicken Flavour Ramen Cup',
    'NongShim Kimchi SHIN Veg 100g',
    'NongShim Bowl Noodle Soup Hot & Spicy',
    'NongShim Bowl Noodle Soup Spicy Chicken',
    'Lay''s American Style Cream & Onion',
    'Lay''s Sizlin'' Hot'
  )
ORDER BY mi.name;

