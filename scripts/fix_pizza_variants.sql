-- Fix Pizza items to have separate Regular and Medium variants
-- This script splits pizza items into separate Regular and Medium variants for frontend grouping
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
    
    RAISE NOTICE 'Fixing Pizza variants (ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- 1. REMOVE EXISTING SINGLE PRICE PIZZA ITEMS
    -- ========================================
    
    -- Remove the existing single-price pizza items
    DELETE FROM public.menu_items 
    WHERE cafe_id = cook_house_cafe_id 
    AND category = 'Pizza'
    AND name IN (
        'Margherita',
        'All Veg Pizza',
        'Paneer Tikka Pizza',
        'Classic Pesto Pizza',
        'Chicken Tikka Pizza'
    );
    
    RAISE NOTICE 'Removed 5 single-price pizza items';
    
    -- ========================================
    -- 2. ADD SEPARATE REGULAR AND MEDIUM PIZZA ITEMS
    -- ========================================
    
    -- Add separate pizza items with Regular and Medium pricing
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    -- Margherita: Regular ₹99, Medium ₹160
    (cook_house_cafe_id, 'Margherita (Regular)', 'Margherita pizza - regular size', 99, 'Pizza', true),
    (cook_house_cafe_id, 'Margherita (Medium)', 'Margherita pizza - medium size', 160, 'Pizza', true),
    
    -- All Veg Pizza: Regular ₹130, Medium ₹180
    (cook_house_cafe_id, 'All Veg Pizza (Regular)', 'All vegetable pizza - regular size', 130, 'Pizza', true),
    (cook_house_cafe_id, 'All Veg Pizza (Medium)', 'All vegetable pizza - medium size', 180, 'Pizza', true),
    
    -- Paneer Tikka Pizza: Regular ₹160, Medium ₹200
    (cook_house_cafe_id, 'Paneer Tikka Pizza (Regular)', 'Paneer tikka pizza - regular size', 160, 'Pizza', true),
    (cook_house_cafe_id, 'Paneer Tikka Pizza (Medium)', 'Paneer tikka pizza - medium size', 200, 'Pizza', true),
    
    -- Classic Pesto Pizza: Regular ₹165, Medium ₹205
    (cook_house_cafe_id, 'Classic Pesto Pizza (Regular)', 'Classic pesto pizza - regular size', 165, 'Pizza', true),
    (cook_house_cafe_id, 'Classic Pesto Pizza (Medium)', 'Classic pesto pizza - medium size', 205, 'Pizza', true),
    
    -- Chicken Tikka Pizza: Regular ₹195, Medium ₹225
    (cook_house_cafe_id, 'Chicken Tikka Pizza (Regular)', 'Chicken tikka pizza - regular size', 195, 'Pizza', true),
    (cook_house_cafe_id, 'Chicken Tikka Pizza (Medium)', 'Chicken tikka pizza - medium size', 225, 'Pizza', true);
    
    RAISE NOTICE 'Added 10 pizza items (5 pizzas × 2 sizes each)';
    
    -- ========================================
    -- 3. VERIFICATION
    -- ========================================
    
    -- Count pizza items
    DECLARE
        pizza_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO pizza_count 
        FROM public.menu_items 
        WHERE cafe_id = cook_house_cafe_id 
        AND category = 'Pizza';
        
        RAISE NOTICE 'Total pizza items after fix: %', pizza_count;
    END;
    
    RAISE NOTICE 'Pizza variants fix completed successfully!';
    
END $$;

-- Verification query to show the updated pizza items
SELECT 
    'PIZZA VARIANTS FIX COMPLETE' as status,
    COUNT(*) as total_pizza_items
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' AND mi.category = 'Pizza';

-- Show all pizza items with their prices, grouped by base name
SELECT 
    CASE 
        WHEN mi.name LIKE '%(Regular)' THEN REPLACE(mi.name, ' (Regular)', '')
        WHEN mi.name LIKE '%(Medium)' THEN REPLACE(mi.name, ' (Medium)', '')
        ELSE mi.name
    END as base_name,
    mi.name as full_name,
    mi.price,
    mi.is_available
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' AND mi.category = 'Pizza'
ORDER BY 
    CASE 
        WHEN mi.name LIKE '%(Regular)' THEN REPLACE(mi.name, ' (Regular)', '')
        WHEN mi.name LIKE '%(Medium)' THEN REPLACE(mi.name, ' (Medium)', '')
        ELSE mi.name
    END,
    mi.name;
