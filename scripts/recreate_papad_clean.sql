-- Recreate papad items to match the image
-- This script deletes all existing papad items and re-inserts the 2 unique ones from the image
-- Each item will have Roasted and Fried variants with specified prices
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
    
    RAISE NOTICE 'Recreating papad items for Cook House (Cafe ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- DELETE ALL EXISTING PAPAD ITEMS
    -- ========================================
    
    RAISE NOTICE 'Deleting all existing papad items...';
    DELETE FROM public.menu_items 
    WHERE cafe_id = cook_house_cafe_id 
    AND category = 'Papad';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % existing papad items.', deleted_count;
    
    -- ========================================
    -- INSERT NEW PAPAD ITEMS WITH VARIANTS
    -- ========================================
    
    RAISE NOTICE 'Inserting new papad items with Roasted/Fried variants...';

    -- Plain Papad (Roasted/Fried): 40/50
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Plain Papad (Roasted)', 'Crispy roasted plain papad', 40, 'Papad', true),
    (cook_house_cafe_id, 'Plain Papad (Fried)', 'Crispy fried plain papad', 50, 'Papad', true);
    
    -- Masala Papad (Roasted/Fried): 60/70
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Masala Papad (Roasted)', 'Crispy roasted masala papad with toppings', 60, 'Papad', true),
    (cook_house_cafe_id, 'Masala Papad (Fried)', 'Crispy fried masala papad with toppings', 70, 'Papad', true);
    
    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    RAISE NOTICE 'Inserted % new papad items.', inserted_count;
    
    RAISE NOTICE 'Papad items recreation complete.';

END $$;

-- Verification query to show the 4 papad items (2 base items with 2 variants each)
SELECT 
    'PAPAD RECREATION COMPLETE' as status,
    COUNT(*) as total_papad_items
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Papad';

-- Show all papad items
SELECT 
    mi.name,
    mi.price,
    mi.is_available,
    CASE 
        WHEN mi.name ILIKE '%roasted%' THEN '✅ Roasted Variant'
        WHEN mi.name ILIKE '%fried%' THEN '✅ Fried Variant'
        ELSE '❌ Check naming'
    END as variant_type
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Papad'
ORDER BY 
    CASE 
        WHEN mi.name ILIKE '%plain%' THEN 1
        WHEN mi.name ILIKE '%masala%' THEN 2
        ELSE 3
    END,
    mi.name;
