-- Fix image URLs and categories for recently added instant food items in Grabit

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

    -- Helper macro: update category + image
    PERFORM 1; -- keeps block valid

    UPDATE public.menu_items
    SET category = 'INSTANTFOOD',
        image_url = 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/Nissin%20Cup%20Noodles%20Rich%20Seafood%20Curry.webp?updatedAt=1762539794911',
        updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id
      AND name = 'Nissin Rich Seafood Curry Cup Noodles';

    UPDATE public.menu_items
    SET category = 'INSTANTFOOD',
        image_url = 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/Nissin%20Cup%20Noodles%20Spicy%20Chunky%20Chicken.webp?updatedAt=1762539794933',
        updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id
      AND name = 'Nissin Cup Noodles Spicy Chunky Chicken';

    UPDATE public.menu_items
    SET category = 'INSTANTFOOD',
        image_url = 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/Nissin%20Cup%20Noodles%20Chilli%20Super%20Hot.webp?updatedAt=1762539795067',
        updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id
      AND name = 'Nissin Cup Noodles Chilli Super Hot';

    UPDATE public.menu_items
    SET category = 'INSTANTFOOD',
        image_url = 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/Geki%20Kimchi%20SHIN.webp?updatedAt=1762539794943',
        updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id
      AND name = 'Geki Kimchi SHIN';

    UPDATE public.menu_items
    SET category = 'INSTANTFOOD',
        image_url = 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/Geki%20Korean%20Kimchi%20Hot%20%26%20Spicy.webp?updatedAt=1762539795075',
        updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id
      AND name = 'Geki Korean Kimchi Hot & Spicy';

    UPDATE public.menu_items
    SET category = 'INSTANTFOOD',
        image_url = 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/Geki%20Korean%20Chicken.webp?updatedAt=1762539794906',
        updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id
      AND name = 'Geki Korean Chicken';

    UPDATE public.menu_items
    SET category = 'INSTANTFOOD',
        image_url = 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/Geki%20Veg%20Korean.webp?updatedAt=1762539794809',
        updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id
      AND name = 'Geki Veg Korean';

    UPDATE public.menu_items
    SET category = 'INSTANTFOOD',
        image_url = 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/Samyang%20Spicy%202X%20Buldak%20Hot%20Chicken%20Flavor%20Ramen%20Cup%20Noodles.jpg?updatedAt=1762539794872',
        updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id
      AND name = 'Samyang Spicy 2X Buldak Hot Chicken Flavour Ramen Cup';

    UPDATE public.menu_items
    SET category = 'INSTANTFOOD',
        image_url = 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/NongShin/Kimchi%20SHIN%20Veg%20100g.webp?updatedAt=1762539794630',
        updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id
      AND name = 'NongShim Kimchi SHIN Veg 100g';

    UPDATE public.menu_items
    SET category = 'INSTANTFOOD',
        image_url = 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/NongShin/NongShim%20Bowl%20Noodle%20Soup%20Hot%20%26%20Spicy.jpg?updatedAt=1762539794518',
        updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id
      AND name = 'NongShim Bowl Noodle Soup Hot & Spicy';

    UPDATE public.menu_items
    SET category = 'INSTANTFOOD',
        image_url = 'https://ik.imagekit.io/foodclub/Grocery/Products/Noodles/NongShin/NongShim%20Bowl%20Noodle%20Soup%20Spicy%20Chicken.jpg?updatedAt=1762539794884',
        updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id
      AND name = 'NongShim Bowl Noodle Soup Spicy Chicken';

    -- Ensure chips entries use correct encoded URLs
    UPDATE public.menu_items
    SET category = 'CHIPS',
        image_url = 'https://ik.imagekit.io/foodclub/Grocery/Products/Chips/American%20Style%20Cream%20%26%20Onion.webp?updatedAt=1762539852910',
        updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id
      AND name = 'Lay''s American Style Cream & Onion';

    UPDATE public.menu_items
    SET category = 'CHIPS',
        image_url = 'https://ik.imagekit.io/foodclub/Grocery/Products/Chips/Sizzlin%20Hot.jpg?updatedAt=1762539852797',
        updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id
      AND name = 'Lay''s Sizlin'' Hot';

END $$;

-- Verify the updates
SELECT mi.name, mi.category, mi.image_url
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





