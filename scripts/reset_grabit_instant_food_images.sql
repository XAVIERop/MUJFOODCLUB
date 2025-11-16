-- Reset image URLs for specified Grabit items (use default card styling without images)

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
    SET image_url = NULL,
        updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id
      AND name IN (
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
      );

END $$;

-- Verification: confirm image_url cleared
SELECT mi.name, mi.image_url
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



