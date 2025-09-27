-- Update vegetarian/non-vegetarian classification for Cook House menu items
-- This script sets the is_vegetarian field based on the menu analysis
-- Run this in Supabase Dashboard → SQL Editor

DO $$
DECLARE
    cook_house_cafe_id UUID;
    updated_count INTEGER := 0;
BEGIN
    -- Get Cook House cafe ID
    SELECT id INTO cook_house_cafe_id FROM public.cafes WHERE name = 'COOK HOUSE';
    
    IF cook_house_cafe_id IS NULL THEN
        RAISE EXCEPTION 'Cook House cafe not found';
    END IF;
    
    RAISE NOTICE 'Updating veg/non-veg classification for Cook House (Cafe ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- SET ALL ITEMS AS VEGETARIAN BY DEFAULT
    -- ========================================
    
    UPDATE public.menu_items 
    SET is_vegetarian = true, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Set % items as vegetarian by default', updated_count;
    
    -- ========================================
    -- MARK NON-VEGETARIAN ITEMS
    -- ========================================
    
    -- Chicken Starters
    UPDATE public.menu_items 
    SET is_vegetarian = false, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND (
        name ILIKE '%chicken tikka%' OR
        name ILIKE '%aachari chicken%' OR
        name ILIKE '%garlic chicken%' OR
        name ILIKE '%murgh malai%' OR
        name ILIKE '%chicken seekh%' OR
        name ILIKE '%tandoori chicken%' OR
        name ILIKE '%pudina chicken%'
    );
    
    -- Chicken Main Course
    UPDATE public.menu_items 
    SET is_vegetarian = false, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND (
        name ILIKE '%butter chicken%' OR
        name ILIKE '%chicken tikka masala%' OR
        name ILIKE '%chicken patiala%' OR
        name ILIKE '%chicken rara%' OR
        name ILIKE '%chicken champaran%' OR
        name ILIKE '%kolkata chicken%' OR
        name ILIKE '%chicken kadhai%' OR
        name ILIKE '%methi murgh%'
    );
    
    -- Mutton Items
    UPDATE public.menu_items 
    SET is_vegetarian = false, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND (
        name ILIKE '%mutton%' OR
        name ILIKE '%lal mass%' OR
        name ILIKE '%rogan josh%'
    );
    
    -- Egg Items
    UPDATE public.menu_items 
    SET is_vegetarian = false, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND (
        name ILIKE '%egg%' OR
        name ILIKE '%anda%'
    );
    
    -- Chicken China Wall Items
    UPDATE public.menu_items 
    SET is_vegetarian = false, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND (
        name ILIKE '%chicken fried rice%' OR
        name ILIKE '%chicken hakka noodles%' OR
        name ILIKE '%chilli chicken%'
    );
    
    -- Chef's Special Non-Veg
    UPDATE public.menu_items 
    SET is_vegetarian = false, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND (
        name ILIKE '%jungli chicken%' OR
        name ILIKE '%anda ghotala%'
    );
    
    -- Keema Pao
    UPDATE public.menu_items 
    SET is_vegetarian = false, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND name ILIKE '%keema pao%';
    
    -- Non-Veg Sandwiches
    UPDATE public.menu_items 
    SET is_vegetarian = false, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND (
        name ILIKE '%omlette sandwich%' OR
        name ILIKE '%chicken tikka sandwich%'
    );
    
    -- Chicken Pizza
    UPDATE public.menu_items 
    SET is_vegetarian = false, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND name ILIKE '%chicken tikka pizza%';
    
    -- Non-Veg Rolls
    UPDATE public.menu_items 
    SET is_vegetarian = false, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND (
        name ILIKE '%egg roll%' OR
        name ILIKE '%chicken roll%' OR
        name ILIKE '%chicken seekh kebab roll%'
    );
    
    -- Non-Veg Combo Meals
    UPDATE public.menu_items 
    SET is_vegetarian = false, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND name ILIKE '%punjabi chicken curry%';
    
    -- Non-Veg Soups (only the non-veg variants)
    UPDATE public.menu_items 
    SET is_vegetarian = false, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND (
        name ILIKE '%murgh shejani%' OR
        name ILIKE '%manchaw soup (non-veg)%' OR
        name ILIKE '%hot''n''sour (non-veg)%'
    );
    
    -- Chicken Nuggets
    UPDATE public.menu_items 
    SET is_vegetarian = false, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND name ILIKE '%chicken nuggets%';
    
    -- Non-Veg Maggi
    UPDATE public.menu_items 
    SET is_vegetarian = false, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND (
        name ILIKE '%chicken keema maggi%' OR
        name ILIKE '%mutton keema maggi%'
    );
    
    -- Non-Veg Thali
    UPDATE public.menu_items 
    SET is_vegetarian = false, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND name ILIKE '%special thali%' AND name ILIKE '%non-veg%';
    
    -- Non-Veg Biryani
    UPDATE public.menu_items 
    SET is_vegetarian = false, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND (
        name ILIKE '%hyderabadi dum murg%' OR
        name ILIKE '%chicken tikka biryani%' OR
        name ILIKE '%egg biryani%' OR
        name ILIKE '%mutton keema pulao%'
    );
    
    RAISE NOTICE 'Veg/Non-veg classification updated successfully!';
    
END $$;

-- Verification queries
SELECT 
    'VEGETARIAN ITEMS' as category,
    COUNT(*) as count
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.is_vegetarian = true

UNION ALL

SELECT 
    'NON-VEGETARIAN ITEMS' as category,
    COUNT(*) as count
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.is_vegetarian = false;

-- Show sample of non-vegetarian items
SELECT 
    mi.name,
    mi.category,
    mi.is_vegetarian
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.is_vegetarian = false
ORDER BY mi.category, mi.name
LIMIT 20;
