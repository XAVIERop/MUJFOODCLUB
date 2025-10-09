-- Create consolidated Gravy Momos items for Munch Box
-- This will create single items with variant options

-- First, get the Munch Box cafe ID
-- (You'll need to replace 'MUNCH_BOX_CAFE_ID' with the actual cafe ID)

-- Create consolidated Tandoori Masala Gravy Momos
INSERT INTO public.menu_items (
    name,
    description,
    price,
    category,
    subcategory,
    cafe_id,
    preparation_time,
    is_available,
    created_at,
    updated_at
) VALUES (
    'Tandoori Masala Gravy Momos',
    'Delicious momos in tandoori masala gravy - choose your variant',
    160, -- Base price (will be adjusted per variant)
    'Gravy Momos',
    'Momos',
    (SELECT id FROM cafes WHERE name ILIKE '%munch box%'),
    15,
    true,
    NOW(),
    NOW()
);

-- Create consolidated Makhani Malai Momos
INSERT INTO public.menu_items (
    name,
    description,
    price,
    category,
    subcategory,
    cafe_id,
    preparation_time,
    is_available,
    created_at,
    updated_at
) VALUES (
    'Makhani Malai Momos',
    'Creamy makhani malai momos - choose your variant',
    160,
    'Gravy Momos',
    'Momos',
    (SELECT id FROM cafes WHERE name ILIKE '%munch box%'),
    15,
    true,
    NOW(),
    NOW()
);

-- Create consolidated Chilli Garlic Gravy Momos
INSERT INTO public.menu_items (
    name,
    description,
    price,
    category,
    subcategory,
    cafe_id,
    preparation_time,
    is_available,
    created_at,
    updated_at
) VALUES (
    'Chilli Garlic Gravy Momos',
    'Spicy chilli garlic gravy momos - choose your variant',
    160,
    'Gravy Momos',
    'Momos',
    (SELECT id FROM cafes WHERE name ILIKE '%munch box%'),
    15,
    true,
    NOW(),
    NOW()
);

-- Create consolidated Peri-Peri Momos
INSERT INTO public.menu_items (
    name,
    description,
    price,
    category,
    subcategory,
    cafe_id,
    preparation_time,
    is_available,
    created_at,
    updated_at
) VALUES (
    'Peri-Peri Momos',
    'Spicy peri-peri momos - choose your variant',
    160,
    'Gravy Momos',
    'Momos',
    (SELECT id FROM cafes WHERE name ILIKE '%munch box%'),
    15,
    true,
    NOW(),
    NOW()
);

-- Create consolidated Afgani Style Momos
INSERT INTO public.menu_items (
    name,
    description,
    price,
    category,
    subcategory,
    cafe_id,
    preparation_time,
    is_available,
    created_at,
    updated_at
) VALUES (
    'Afgani Style Momos',
    'Rich afgani style momos - choose your variant',
    160,
    'Gravy Momos',
    'Momos',
    (SELECT id FROM cafes WHERE name ILIKE '%munch box%'),
    15,
    true,
    NOW(),
    NOW()
);

-- Create consolidated Schezwan Chilli Gravy Momos
INSERT INTO public.menu_items (
    name,
    description,
    price,
    category,
    subcategory,
    cafe_id,
    preparation_time,
    is_available,
    created_at,
    updated_at
) VALUES (
    'Schezwan Chilli Gravy Momos',
    'Spicy schezwan chilli gravy momos - choose your variant',
    160,
    'Gravy Momos',
    'Momos',
    (SELECT id FROM cafes WHERE name ILIKE '%munch box%'),
    15,
    true,
    NOW(),
    NOW()
);
