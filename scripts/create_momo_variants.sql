-- Create variant options for each consolidated momo
-- This creates the Veg/Paneer options for each momo type

-- Get the newly created momo items and create variants
-- Tandoori Masala Gravy variants
INSERT INTO public.menu_item_variants (
    menu_item_id,
    variant_name,
    price_adjustment,
    is_available,
    created_at,
    updated_at
) VALUES 
(
    (SELECT id FROM menu_items WHERE name = 'Tandoori Masala Gravy Momos' AND cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%munch box%')),
    'Veg',
    0,
    true,
    NOW(),
    NOW()
),
(
    (SELECT id FROM menu_items WHERE name = 'Tandoori Masala Gravy Momos' AND cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%munch box%')),
    'Paneer',
    0,
    true,
    NOW(),
    NOW()
);

-- Makhani Malai variants
INSERT INTO public.menu_item_variants (
    menu_item_id,
    variant_name,
    price_adjustment,
    is_available,
    created_at,
    updated_at
) VALUES 
(
    (SELECT id FROM menu_items WHERE name = 'Makhani Malai Momos' AND cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%munch box%')),
    'Veg',
    0,
    true,
    NOW(),
    NOW()
),
(
    (SELECT id FROM menu_items WHERE name = 'Makhani Malai Momos' AND cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%munch box%')),
    'Paneer',
    0,
    true,
    NOW(),
    NOW()
);

-- Chilli Garlic Gravy variants
INSERT INTO public.menu_item_variants (
    menu_item_id,
    variant_name,
    price_adjustment,
    is_available,
    created_at,
    updated_at
) VALUES 
(
    (SELECT id FROM menu_items WHERE name = 'Chilli Garlic Gravy Momos' AND cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%munch box%')),
    'Veg',
    0,
    true,
    NOW(),
    NOW()
),
(
    (SELECT id FROM menu_items WHERE name = 'Chilli Garlic Gravy Momos' AND cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%munch box%')),
    'Paneer',
    0,
    true,
    NOW(),
    NOW()
);

-- Peri-Peri variants
INSERT INTO public.menu_item_variants (
    menu_item_id,
    variant_name,
    price_adjustment,
    is_available,
    created_at,
    updated_at
) VALUES 
(
    (SELECT id FROM menu_items WHERE name = 'Peri-Peri Momos' AND cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%munch box%')),
    'Veg',
    0,
    true,
    NOW(),
    NOW()
),
(
    (SELECT id FROM menu_items WHERE name = 'Peri-Peri Momos' AND cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%munch box%')),
    'Paneer',
    0,
    true,
    NOW(),
    NOW()
);

-- Afgani Style variants
INSERT INTO public.menu_item_variants (
    menu_item_id,
    variant_name,
    price_adjustment,
    is_available,
    created_at,
    updated_at
) VALUES 
(
    (SELECT id FROM menu_items WHERE name = 'Afgani Style Momos' AND cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%munch box%')),
    'Veg',
    0,
    true,
    NOW(),
    NOW()
),
(
    (SELECT id FROM menu_items WHERE name = 'Afgani Style Momos' AND cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%munch box%')),
    'Paneer',
    0,
    true,
    NOW(),
    NOW()
);

-- Schezwan Chilli Gravy variants
INSERT INTO public.menu_item_variants (
    menu_item_id,
    variant_name,
    price_adjustment,
    is_available,
    created_at,
    updated_at
) VALUES 
(
    (SELECT id FROM menu_items WHERE name = 'Schezwan Chilli Gravy Momos' AND cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%munch box%')),
    'Veg',
    0,
    true,
    NOW(),
    NOW()
),
(
    (SELECT id FROM menu_items WHERE name = 'Schezwan Chilli Gravy Momos' AND cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%munch box%')),
    'Paneer',
    0,
    true,
    NOW(),
    NOW()
);
