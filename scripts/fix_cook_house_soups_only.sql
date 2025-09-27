-- Fix Cook House Soups Section Only
-- This script updates the soups to have separate Veg/Non-veg items with correct pricing
-- Run this in Supabase Dashboard → SQL Editor

DO $$
DECLARE
    cook_house_cafe_id UUID;
BEGIN
    -- Get Cook House cafe ID
    SELECT id INTO cook_house_cafe_id FROM public.cafes WHERE name = 'COOK HOUSE';
    
    IF cook_house_cafe_id IS NULL THEN
        RAISE EXCEPTION 'Cook House cafe not found';
    END IF;
    
    RAISE NOTICE 'Fixing Cook House soups (ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- 1. REMOVE EXISTING SOUP ITEMS
    -- ========================================
    
    -- Remove the combined soup items
    DELETE FROM public.menu_items 
    WHERE cafe_id = cook_house_cafe_id 
    AND name IN (
        'Manchaw Soup (Veg/Non-veg)',
        'Hot''n''sour (Veg/Non-veg)'
    );
    
    RAISE NOTICE 'Removed 2 combined soup items';
    
    -- ========================================
    -- 2. ADD SEPARATE VEG/NON-VEG SOUP ITEMS
    -- ========================================
    
    -- Add separate soup items with correct pricing
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Manchaw Soup (Veg)', 'Manchaw soup - vegetarian', 100, 'Soups', true),
    (cook_house_cafe_id, 'Manchaw Soup (Non-veg)', 'Manchaw soup - non-vegetarian', 120, 'Soups', true),
    (cook_house_cafe_id, 'Hot''n''sour (Veg)', 'Hot and sour soup - vegetarian', 100, 'Soups', true),
    (cook_house_cafe_id, 'Hot''n''sour (Non-veg)', 'Hot and sour soup - non-vegetarian', 120, 'Soups', true);
    
    RAISE NOTICE 'Added 4 separate soup items with correct pricing';
    
    -- ========================================
    -- 3. VERIFICATION
    -- ========================================
    
    -- Count soup items
    DECLARE
        soup_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO soup_count 
        FROM public.menu_items 
        WHERE cafe_id = cook_house_cafe_id 
        AND category = 'Soups';
        
        RAISE NOTICE 'Total soup items after fix: %', soup_count;
    END;
    
    RAISE NOTICE 'Cook House soups fix completed successfully!';
    
END $$;

-- Verification query to show the updated soups
SELECT 
    'COOK HOUSE SOUPS FIX COMPLETE' as status,
    COUNT(*) as total_soup_items
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' AND mi.category = 'Soups';

-- Show all soup items with their prices
SELECT 
    mi.name,
    mi.price,
    mi.is_available
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' AND mi.category = 'Soups'
ORDER BY mi.name;
