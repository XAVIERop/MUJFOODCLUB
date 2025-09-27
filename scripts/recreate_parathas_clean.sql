-- Recreate paratha items to fix duplicates
-- This script deletes all existing paratha items and re-inserts the 7 unique ones
-- Run this in Supabase Dashboard → SQL Editor

DO $$
DECLARE
    cook_house_cafe_id UUID;
    deleted_count INTEGER := 0;
    inserted_count INTEGER := 0;
BEGIN
    -- Get Cook House cafe ID
    SELECT id INTO cook_house_cafe_id FROM public.cafes WHERE name = 'COOK HOUSE';
    
    IF cook_house_cafe_id IS NULL THEN
        RAISE EXCEPTION 'Cook House cafe not found';
    END IF;
    
    RAISE NOTICE 'Recreating paratha items for Cook House (Cafe ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- DELETE ALL EXISTING PARATHA ITEMS
    -- ========================================
    
    RAISE NOTICE 'Deleting all existing paratha items...';
    DELETE FROM public.menu_items 
    WHERE cafe_id = cook_house_cafe_id 
    AND category = 'Breads'
    AND (
        name ILIKE '%paratha%'
        OR name ILIKE '%pudina laccha%'
        OR name ILIKE '%hari mirch laccha%'
        OR name ILIKE '%laccha paratha%'
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % existing paratha items.', deleted_count;

    -- ========================================
    -- RE-INSERT UNIQUE PARATHA ITEMS
    -- ========================================
    
    RAISE NOTICE 'Re-inserting 7 unique paratha items...';
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Aloo Paratha (2pcs)', 'Potato stuffed paratha - 2 pieces with curd & pickle', 140, 'Breads', true),
    (cook_house_cafe_id, 'Aloo Pyaaz Paratha (2pcs)', 'Potato and onion stuffed paratha - 2 pieces with curd & pickle', 150, 'Breads', true),
    (cook_house_cafe_id, 'Paneer Onion Paratha (2pcs)', 'Cottage cheese and onion stuffed paratha - 2 pieces with curd & pickle', 160, 'Breads', true),
    (cook_house_cafe_id, 'Gobhi Paratha (2pcs)', 'Cauliflower stuffed paratha - 2 pieces with curd & pickle', 140, 'Breads', true),
    (cook_house_cafe_id, 'Onion Cheese Paratha (2pcs)', 'Onion and cheese stuffed paratha - 2 pieces with curd & pickle', 170, 'Breads', true),
    (cook_house_cafe_id, 'Cheese Corn Paratha (2pcs)', 'Cheese and corn stuffed paratha - 2 pieces with curd & pickle', 160, 'Breads', true),
    (cook_house_cafe_id, 'Mix Paratha (2pcs)', 'Mixed vegetable stuffed paratha - 2 pieces with curd & pickle', 160, 'Breads', true);
    
    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    RAISE NOTICE 'Inserted % new paratha items.', inserted_count;

    RAISE NOTICE 'Paratha recreation complete. Please refresh your frontend.';

END $$;

-- Verification query to show the 7 unique paratha items
SELECT 
    'PARATHA RECREATION COMPLETE' as status,
    COUNT(*) as total_parathas
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Breads'
AND mi.name ILIKE '%paratha%';

-- Show all paratha items
SELECT 
    mi.name,
    mi.price,
    mi.is_available,
    '✅ Unique Paratha' as status
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Breads'
AND mi.name ILIKE '%paratha%'
ORDER BY mi.name;
