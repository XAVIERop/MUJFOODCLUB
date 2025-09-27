-- Fix Thali descriptions to show full text
-- This script updates Thali descriptions to show complete text without truncation
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
    
    RAISE NOTICE 'Fixing Thali descriptions for Cook House (Cafe ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- UPDATE THALI DESCRIPTIONS
    -- ========================================
    
    -- Update SPECIAL THALI (Veg) description
    UPDATE public.menu_items 
    SET description = 'Paneer Lababdar + Dal Makhani + Vegetable + Rice + 2 Tandoori Roti + 1 Laccha Paratha + Raita + Salad + Pickle + Papad', 
        updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND name = 'SPECIAL THALI (Veg)';
    
    -- Update SPECIAL THALI (Non-Veg) description
    UPDATE public.menu_items 
    SET description = 'Butter Chicken + Egg Curry + Dal Makhni + Rice + 2 Tandoori Roti + 1 Laccha Paratha + Raita + Salad + Pickle + Papad', 
        updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND name = 'SPECIAL THALI (Non-Veg)';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % Thali descriptions', updated_count;
    
    RAISE NOTICE 'Thali descriptions fixed successfully!';
    
END $$;

-- Verification query to show updated Thali descriptions
SELECT 
    'UPDATED THALI DESCRIPTIONS' as status,
    mi.name,
    mi.description,
    LENGTH(mi.description) as description_length
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Thali'
ORDER BY mi.name;
