-- Recreate raita items to match the image
-- This script deletes all existing raita items and re-inserts the 3 unique ones from the image
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
    
    RAISE NOTICE 'Recreating raita items for Cook House (Cafe ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- DELETE ALL EXISTING RAITA ITEMS
    -- ========================================
    
    RAISE NOTICE 'Deleting all existing raita items...';
    DELETE FROM public.menu_items 
    WHERE cafe_id = cook_house_cafe_id 
    AND category = 'Raita';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % existing raita items.', deleted_count;

    -- ========================================
    -- RE-INSERT UNIQUE RAITA ITEMS FROM IMAGE
    -- ========================================
    
    RAISE NOTICE 'Re-inserting 3 unique raita items from image...';
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Mix veg Raita', 'Mixed vegetable raita', 110, 'Raita', true),
    (cook_house_cafe_id, 'Nupuri Raita (Boondi)', 'Boondi raita', 100, 'Raita', true),
    (cook_house_cafe_id, 'Fried Raita', 'Fried raita', 110, 'Raita', true);
    
    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    RAISE NOTICE 'Inserted % new raita items.', inserted_count;

    RAISE NOTICE 'Raita recreation complete. Please refresh your frontend.';

END $$;

-- Verification query to show the 3 unique raita items
SELECT 
    'RAITA RECREATION COMPLETE' as status,
    COUNT(*) as total_raita_items
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Raita';

-- Show all raita items
SELECT 
    mi.name,
    mi.price,
    mi.is_available,
    '✅ Unique Raita' as status
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Raita'
ORDER BY mi.name;
