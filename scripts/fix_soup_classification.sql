-- Fix soup classification only
-- This script fixes the soup items to be correctly classified as veg/non-veg
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
    
    RAISE NOTICE 'Fixing soup classification for Cook House (Cafe ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- FIX SOUP CLASSIFICATION
    -- ========================================
    
    -- Set all soup items as vegetarian by default
    UPDATE public.menu_items 
    SET is_vegetarian = true, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND category = 'Soups';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Set % soup items as vegetarian by default', updated_count;
    
    -- Mark non-vegetarian soup variants
    UPDATE public.menu_items 
    SET is_vegetarian = false, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND category = 'Soups'
    AND (
        name ILIKE '%murgh shejani%' OR
        name ILIKE '%manchaw soup (non-veg)%' OR
        name ILIKE '%hot''n''sour (non-veg)%'
    );
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Marked % soup items as non-vegetarian', updated_count;
    
    RAISE NOTICE 'Soup classification fixed successfully!';
    
END $$;

-- Verification query to show soup classification
SELECT 
    'SOUP CLASSIFICATION FIXED' as status,
    COUNT(*) as total_soups
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Soups';

-- Show all soup items with their classification
SELECT 
    mi.name,
    mi.price,
    mi.is_vegetarian,
    CASE 
        WHEN mi.is_vegetarian = true THEN '✅ Vegetarian'
        ELSE '❌ Non-Vegetarian'
    END as classification
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Soups'
ORDER BY mi.is_vegetarian DESC, mi.name;
