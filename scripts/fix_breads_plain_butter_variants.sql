-- Fix breads to have Plain/Butter variants
-- This script splits bread items into Plain and Butter variants with correct prices
-- Run this in Supabase Dashboard → SQL Editor

DO $$
DECLARE
    cook_house_cafe_id UUID;
    deleted_count INTEGER := 0;
BEGIN
    -- Get Cook House cafe ID
    SELECT id INTO cook_house_cafe_id FROM public.cafes WHERE name = 'COOK HOUSE';
    
    IF cook_house_cafe_id IS NULL THEN
        RAISE EXCEPTION 'Cook House cafe not found';
    END IF;
    
    RAISE NOTICE 'Fixing breads Plain/Butter variants (Cafe ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- DELETE EXISTING BREAD ITEMS
    -- ========================================
    
    -- Delete existing bread items that need variants
    DELETE FROM public.menu_items 
    WHERE cafe_id = cook_house_cafe_id 
    AND category = 'Breads'
    AND (name ILIKE '%tandoori roti%' OR 
         name ILIKE '%pudina laccha paratha%' OR 
         name ILIKE '%hari mirch laccha paratha%' OR 
         name ILIKE '%laccha paratha%' OR 
         name ILIKE '%naan%' OR 
         name ILIKE '%garlic naan%' OR 
         name ILIKE '%missi roti%');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    IF deleted_count > 0 THEN
        RAISE NOTICE 'Deleted % existing bread items', deleted_count;
    END IF;
    
    -- ========================================
    -- INSERT PLAIN/BUTTER VARIANTS
    -- ========================================
    
    -- Tandoori Roti (Plain/Butter): 18/22
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Tandoori Roti (Plain)', 'Tandoori Roti - Plain', 18, 'Breads', true),
    (cook_house_cafe_id, 'Tandoori Roti (Butter)', 'Tandoori Roti - Butter', 22, 'Breads', true);
    
    -- Pudina Laccha Paratha (Plain/Butter): 50/60
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Pudina Laccha Paratha (Plain)', 'Pudina Laccha Paratha - Plain', 50, 'Breads', true),
    (cook_house_cafe_id, 'Pudina Laccha Paratha (Butter)', 'Pudina Laccha Paratha - Butter', 60, 'Breads', true);
    
    -- Hari Mirch Laccha Paratha (Plain/Butter): 55/60
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Hari Mirch Laccha Paratha (Plain)', 'Hari Mirch Laccha Paratha - Plain', 55, 'Breads', true),
    (cook_house_cafe_id, 'Hari Mirch Laccha Paratha (Butter)', 'Hari Mirch Laccha Paratha - Butter', 60, 'Breads', true);
    
    -- Laccha Paratha (Plain/Butter): 55/60
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Laccha Paratha (Plain)', 'Laccha Paratha - Plain', 55, 'Breads', true),
    (cook_house_cafe_id, 'Laccha Paratha (Butter)', 'Laccha Paratha - Butter', 60, 'Breads', true);
    
    -- Naan (Plain/Butter): 50/55
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Naan (Plain)', 'Naan - Plain', 50, 'Breads', true),
    (cook_house_cafe_id, 'Naan (Butter)', 'Naan - Butter', 55, 'Breads', true);
    
    -- Garlic Naan (Plain/Butter): 65/75
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Garlic Naan (Plain)', 'Garlic Naan - Plain', 65, 'Breads', true),
    (cook_house_cafe_id, 'Garlic Naan (Butter)', 'Garlic Naan - Butter', 75, 'Breads', true);
    
    -- Missi Roti (Plain/Butter): 55 (same price for both)
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Missi Roti (Plain)', 'Missi Roti - Plain', 55, 'Breads', true),
    (cook_house_cafe_id, 'Missi Roti (Butter)', 'Missi Roti - Butter', 55, 'Breads', true);
    
    RAISE NOTICE 'Created Plain/Butter variants for all bread items';
    RAISE NOTICE 'Breads Plain/Butter variants created successfully!';
    
END $$;

-- Verification query to show bread variants
SELECT 
    'BREADS PLAIN/BUTTER VARIANTS CREATED' as status,
    COUNT(*) as total_bread_variants
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Breads'
AND (mi.name ILIKE '%(plain)%' OR mi.name ILIKE '%(butter)%');

-- Show all bread items with their variants
SELECT 
    mi.name,
    mi.price,
    mi.is_available,
    CASE 
        WHEN mi.name ILIKE '%(plain)%' THEN '✅ Plain Variant'
        WHEN mi.name ILIKE '%(butter)%' THEN '✅ Butter Variant'
        ELSE '❌ No Variant'
    END as variant_type
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Breads'
ORDER BY 
    CASE 
        WHEN mi.name ILIKE '%tandoori roti%' THEN 1
        WHEN mi.name ILIKE '%pudina laccha%' THEN 2
        WHEN mi.name ILIKE '%hari mirch%' THEN 3
        WHEN mi.name ILIKE '%laccha paratha%' THEN 4
        WHEN mi.name ILIKE '%naan%' AND mi.name NOT ILIKE '%garlic%' THEN 5
        WHEN mi.name ILIKE '%garlic naan%' THEN 6
        WHEN mi.name ILIKE '%missi roti%' THEN 7
        ELSE 8
    END,
    mi.name;
