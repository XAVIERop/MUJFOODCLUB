-- Add Mother Dairy ice cream items to Grabit cafe
-- This script adds all the Mother Dairy ice cream items to Grabit

DO $$
DECLARE
    grabit_cafe_id UUID;
BEGIN
    -- Get Grabit cafe ID
    SELECT id INTO grabit_cafe_id 
    FROM public.cafes 
    WHERE LOWER(name) LIKE '%grabit%' OR LOWER(slug) = 'grabit'
    LIMIT 1;
    
    IF grabit_cafe_id IS NULL THEN
        RAISE EXCEPTION 'Grabit cafe not found. Please verify the cafe exists.';
    END IF;
    
    RAISE NOTICE 'Found Grabit cafe with ID: %', grabit_cafe_id;
    
    -- Insert all Mother Dairy ice cream items
    INSERT INTO public.menu_items (id, name, description, price, category, is_available, out_of_stock, preparation_time, cafe_id, image_url) VALUES
    (gen_random_uuid(), 'Filter Coffee Cone', 'Mother Dairy Ice Cream 80g', 70.00, 'Ice Cream', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/mother%20dairy%20logo.webp'),
    (gen_random_uuid(), 'Chillz Chocolate Treat', 'Mother Dairy Ice Cream 55g', 35.00, 'Ice Cream', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/mother%20dairy%20logo.webp'),
    (gen_random_uuid(), 'Choco Brownie Cone', 'Mother Dairy Ice Cream 80g', 60.00, 'Ice Cream', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/mother%20dairy%20logo.webp'),
    (gen_random_uuid(), 'Chillz Butterscotch', 'Mother Dairy Ice Cream 70g', 35.00, 'Ice Cream', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/mother%20dairy%20logo.webp'),
    (gen_random_uuid(), 'Chillz Cookie Crunch', 'Mother Dairy Ice Cream 70g', 50.00, 'Ice Cream', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/mother%20dairy%20logo.webp'),
    (gen_random_uuid(), 'Chillz Double Magic', 'Mother Dairy Ice Cream 70g', 30.00, 'Ice Cream', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/mother%20dairy%20logo.webp'),
    (gen_random_uuid(), 'Chillz Crispy Chocobar', 'Mother Dairy Ice Cream 26g', 15.00, 'Ice Cream', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/mother%20dairy%20logo.webp'),
    (gen_random_uuid(), 'Chocobar', 'Mother Dairy Ice Cream 24g', 10.00, 'Ice Cream', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/mother%20dairy%20logo.webp'),
    (gen_random_uuid(), 'Shahi Kulfi Pista', 'Mother Dairy Ice Cream 45g', 25.00, 'Ice Cream', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/mother%20dairy%20logo.webp'),
    (gen_random_uuid(), 'Gulab Kulfi', 'Mother Dairy Ice Cream 50g', 30.00, 'Ice Cream', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/mother%20dairy%20logo.webp'),
    (gen_random_uuid(), 'Chillz Chocolate Bar', 'Mother Dairy Ice Cream 50g', 18.00, 'Ice Cream', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/mother%20dairy%20logo.webp'),
    (gen_random_uuid(), 'Chillz Two In One', 'Mother Dairy Ice Cream 50g', 25.00, 'Ice Cream', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/mother%20dairy%20logo.webp'),
    (gen_random_uuid(), 'Ekdum Aam', 'Mother Dairy Ice Cream 50g', 30.00, 'Ice Cream', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/mother%20dairy%20logo.webp'),
    (gen_random_uuid(), 'Cassatta', 'Mother Dairy Ice Cream 90g', 70.00, 'Ice Cream', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/mother%20dairy%20logo.webp'),
    (gen_random_uuid(), 'Chillz Mango', 'Mother Dairy Ice Cream 55g', 15.00, 'Ice Cream', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/mother%20dairy%20logo.webp'),
    (gen_random_uuid(), 'Royal Rabdi Kulfi', 'Mother Dairy Ice Cream 60g', 25.00, 'Ice Cream', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/mother%20dairy%20logo.webp'),
    (gen_random_uuid(), 'Double Trouble', 'Mother Dairy Ice Cream 50g', 60.00, 'Ice Cream', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/mother%20dairy%20logo.webp'),
    (gen_random_uuid(), 'Shahi Kulfi Malai', 'Mother Dairy Ice Cream 45g', 20.00, 'Ice Cream', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/mother%20dairy%20logo.webp'),
    (gen_random_uuid(), 'Ultimate Kesar Pista', 'Mother Dairy Ice Cream 61g', 50.00, 'Ice Cream', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/mother%20dairy%20logo.webp'),
    (gen_random_uuid(), 'Ultimate Shahi Meva Malai', 'Mother Dairy Ice Cream 61g', 40.00, 'Ice Cream', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/mother%20dairy%20logo.webp'),
    (gen_random_uuid(), 'Mawa Badam Kulfi', 'Mother Dairy Ice Cream 55g', 35.00, 'Ice Cream', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/mother%20dairy%20logo.webp')
    
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'All Mother Dairy ice cream items have been added to Grabit cafe successfully!';
    
END $$;

-- Verify the items were added
SELECT 
    name,
    description,
    price,
    category,
    image_url
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE LOWER(name) LIKE '%grabit%' OR LOWER(slug) = 'grabit')
  AND category = 'Ice Cream'
ORDER BY name;

-- Summary count
SELECT 
    COUNT(*) as total_ice_cream_items,
    MIN(price) as min_price,
    MAX(price) as max_price,
    AVG(price) as avg_price
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE LOWER(name) LIKE '%grabit%' OR LOWER(slug) = 'grabit')
  AND category = 'Ice Cream';

