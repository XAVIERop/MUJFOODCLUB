-- Add chocolate and ice cream items to Grabit cafe
-- This script adds chocolate items and Mother Dairy ice cream items to Grabit

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
    
    -- Insert all chocolate items
    INSERT INTO public.menu_items (id, name, description, price, category, is_available, out_of_stock, preparation_time, cafe_id, image_url) VALUES
    -- Nestle Chocolates
    (gen_random_uuid(), 'Kitkat', 'Nestle Chocolate 38.5g', 35.00, 'Chocolates', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chocolates/Chocolates/Kitkat.webp?updatedAt=1763148228327'),
    (gen_random_uuid(), 'Munch Nuts Max', 'Nestle Chocolate 37.5g', 25.00, 'Chocolates', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chocolates/Chocolates/Munch%20Nuts%20Max.webp?updatedAt=1763148228150'),
    (gen_random_uuid(), 'KitKat Duo', 'Nestle Chocolate 28.5g', 20.00, 'Chocolates', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chocolates/Chocolates/KitKat%20Duo.webp?updatedAt=1763148228698'),
    (gen_random_uuid(), 'Milkybar', 'Nestle Chocolate 22.5g', 20.00, 'Chocolates', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chocolates/Chocolates/Milkybar.webp?updatedAt=1763148228129'),
    (gen_random_uuid(), 'KitKat Share & Snap', 'Nestle Chocolate 57g', 55.00, 'Chocolates', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chocolates/Chocolates/KitKat%20Share%20&%20Snap.avif?updatedAt=1763148228176'),
    (gen_random_uuid(), 'Munch Max', 'Nestle Chocolate 38.5g', 20.00, 'Chocolates', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chocolates/Chocolates/Munch%20Max.webp?updatedAt=1763148228397'),
    
    -- Cadbury Chocolates
    (gen_random_uuid(), 'Perk', 'Cadbury Chocolate 20g', 10.00, 'Chocolates', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chocolates/Chocolates/Perk.webp?updatedAt=1763148228131'),
    (gen_random_uuid(), 'Dairy Milk Crispello', 'Cadbury Chocolate 35g', 45.00, 'Chocolates', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chocolates/Chocolates/Dairy%20Milk%20Crispello.webp?updatedAt=1763148228207'),
    (gen_random_uuid(), 'Dairy Milk Family Pack', 'Cadbury Chocolate 112g', 140.00, 'Chocolates', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chocolates/Chocolates/Dairy%20Milk%20Family%20Pack.webp?updatedAt=1763148228811'),
    (gen_random_uuid(), 'Dairy Milk Fruit & Nut', 'Cadbury Chocolate 75g', 120.00, 'Chocolates', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chocolates/Chocolates/Dairy%20Milk%20Fruit%20&%20Nut.webp?updatedAt=1763148228251'),
    (gen_random_uuid(), '5Star', 'Cadbury Chocolate 33g', 20.00, 'Chocolates', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chocolates/Chocolates/5Star.webp?updatedAt=1763148228214'),
    (gen_random_uuid(), '5Star 3d', 'Cadbury Chocolate 40g', 45.00, 'Chocolates', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chocolates/Chocolates/5Star%203d.webp?updatedAt=1763148228708'),
    (gen_random_uuid(), 'Dairy Milk Crackle', 'Cadbury Chocolate 36g', 55.00, 'Chocolates', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chocolates/Chocolates/Dairy%20Milk%20Crackle.avif?updatedAt=1763148228356'),
    (gen_random_uuid(), 'Fuse', 'Cadbury Chocolate 43g', 45.00, 'Chocolates', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chocolates/Chocolates/Fuse.webp?updatedAt=1763148228191'),
    (gen_random_uuid(), 'Dairy Milk', 'Cadbury Chocolate 20.2g', 20.00, 'Chocolates', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chocolates/Chocolates/Dairy%20Milk.webp?updatedAt=1763148228124'),
    (gen_random_uuid(), 'Dairy Milk Bubbly', 'Cadbury Chocolate 46g', 110.00, 'Chocolates', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chocolates/Chocolates/Dairy%20Milk%20Bubbly.webp?updatedAt=1763148228194'),
    (gen_random_uuid(), 'Dairy Milk Silk Oreo', 'Cadbury Chocolate 58.5g', 110.00, 'Chocolates', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chocolates/Chocolates/Dairy%20Milk%20Silk%20Oreo.webp?updatedAt=1763148228172'),
    
    -- Snickers
    (gen_random_uuid(), 'Snickers Almond', 'Snickers Chocolate 22g', 35.00, 'Chocolates', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chocolates/Chocolates/Snickers%20Almond.webp?updatedAt=1763148228189'),
    
    -- Amul
    (gen_random_uuid(), 'Fruit ''N'' Nut Dark Chocolate', 'Amul Chocolate 40g', 45.00, 'Chocolates', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chocolates/Chocolates/Fruit%20''N''%20Nut%20Dark%20Chocolate%20.webp?updatedAt=1763148228184'),
    
    -- Galaxy
    (gen_random_uuid(), 'Galaxy', 'Galaxy Chocolate 20g', 20.00, 'Chocolates', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chocolates/Chocolates/Galaxy.webp?updatedAt=1763148228241'),
    
    -- RiteBite Protein Bars
    (gen_random_uuid(), 'Max Protein Active Peanut Butter Bar', 'RiteBite Protein bar 70g', 140.00, 'Chocolates', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chocolates/Chocolates/Max%20Protein%20Active%20Peanut%20Butter%20Bar.avif?updatedAt=1763148228168'),
    (gen_random_uuid(), 'Max Protein Active Date & Almond Bar', 'RiteBite Protein bar 75g', 140.00, 'Chocolates', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chocolates/Chocolates/Max%20Protein%20Active%20Date%20&%20Almond%20Bar.avif?updatedAt=1763148228101'),
    (gen_random_uuid(), 'Green Coffee Beans Bar', 'RiteBite Protein bar 70g', 140.00, 'Chocolates', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chocolates/Chocolates/Green%20Coffee%20Beans%20Bar.webp?updatedAt=1763148227665'),
    
    -- Kinder Joy
    (gen_random_uuid(), 'Kinder Joy Blue Edition', 'Kinder Joy Chocolate 20g', 50.00, 'Chocolates', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chocolates/Chocolates/Kinder%20Joy%20Blue%20Edition.webp?updatedAt=1763148228502')
    
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'All chocolate items have been added to Grabit cafe successfully!';
    
    -- Insert all Mother Dairy ice cream items
    INSERT INTO public.menu_items (id, name, description, price, category, is_available, out_of_stock, preparation_time, cafe_id, image_url) VALUES
    -- Mother Dairy Ice Cream
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
  AND category = 'Chocolates'
ORDER BY name;

-- Summary count for Chocolates
SELECT 
    COUNT(*) as total_chocolate_items,
    MIN(price) as min_price,
    MAX(price) as max_price,
    AVG(price) as avg_price
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE LOWER(name) LIKE '%grabit%' OR LOWER(slug) = 'grabit')
  AND category = 'Chocolates';

-- Verify ice cream items were added
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

-- Summary count for Ice Cream
SELECT 
    COUNT(*) as total_ice_cream_items,
    MIN(price) as min_price,
    MAX(price) as max_price,
    AVG(price) as avg_price
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE LOWER(name) LIKE '%grabit%' OR LOWER(slug) = 'grabit')
  AND category = 'Ice Cream';

