-- Fix duplicate soup items in Cook House
-- This script removes duplicate soup entries and keeps only the correct ones
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
    
    RAISE NOTICE 'Fixing soup duplicates for Cook House (Cafe ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- REMOVE DUPLICATE SOUP ITEMS
    -- ========================================
    
    -- Delete duplicate soup items, keeping only one of each
    -- This will keep the first occurrence and delete subsequent duplicates
    DELETE FROM public.menu_items 
    WHERE id IN (
        SELECT t.menu_item_id FROM (
            SELECT mi.id as menu_item_id, 
                   ROW_NUMBER() OVER (
                       PARTITION BY mi.name, mi.price, mi.is_vegetarian 
                       ORDER BY mi.created_at
                   ) as rn
            FROM public.menu_items mi
            JOIN public.cafes c ON mi.cafe_id = c.id
            WHERE c.name = 'COOK HOUSE' 
            AND mi.category = 'Soups'
        ) t
        WHERE t.rn > 1
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % duplicate soup items', deleted_count;
    
    -- ========================================
    -- ENSURE CORRECT SOUP STRUCTURE
    -- ========================================
    
    -- Delete all existing soup items to recreate them cleanly
    DELETE FROM public.menu_items 
    WHERE cafe_id = cook_house_cafe_id 
    AND category = 'Soups';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % existing soup items for clean recreation', deleted_count;
    
    -- Recreate soup items with correct variants
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available, is_vegetarian) VALUES
    -- Manchaw Soup - Veg and Non-veg variants
    (cook_house_cafe_id, 'Manchaw Soup (Veg)', 'Manchaw soup - vegetarian', 100, 'Soups', true, true),
    (cook_house_cafe_id, 'Manchaw Soup (Non-veg)', 'Manchaw soup - non-vegetarian', 120, 'Soups', true, false),
    
    -- Hot'n'sour - Veg and Non-veg variants
    (cook_house_cafe_id, 'Hot''n''sour (Veg)', 'Hot and sour soup - vegetarian', 100, 'Soups', true, true),
    (cook_house_cafe_id, 'Hot''n''sour (Non-veg)', 'Hot and sour soup - non-vegetarian', 120, 'Soups', true, false),
    
    -- Single items
    (cook_house_cafe_id, 'Tomato Basil Soup', 'Tomato basil soup', 100, 'Soups', true, true),
    (cook_house_cafe_id, 'Murgh Shejani Shorba', 'Murgh shejani shorba', 130, 'Soups', true, false);
    
    RAISE NOTICE 'Recreated soup items with correct variants';
    RAISE NOTICE 'Soup duplicates fixed successfully!';
    
END $$;

-- Verification query to show final soup structure
SELECT 
    'FINAL SOUP STRUCTURE' as status,
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
ORDER BY mi.name, mi.is_vegetarian;
