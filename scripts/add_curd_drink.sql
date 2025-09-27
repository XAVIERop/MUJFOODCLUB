-- Add Curd item to Drinks category
-- This script adds the missing Curd item to the Drinks section
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
    
    RAISE NOTICE 'Adding Curd to Drinks (ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- ADD CURD ITEM TO DRINKS
    -- ========================================
    
    -- Add Curd item to Drinks category
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Curd', 'Fresh curd', 70, 'Drinks', true);
    
    RAISE NOTICE 'Added Curd item - ₹70 to Drinks category';
    
    -- ========================================
    -- VERIFICATION
    -- ========================================
    
    -- Count drinks items
    DECLARE
        drinks_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO drinks_count 
        FROM public.menu_items 
        WHERE cafe_id = cook_house_cafe_id 
        AND category = 'Drinks';
        
        RAISE NOTICE 'Total drinks items after adding Curd: %', drinks_count;
    END;
    
    RAISE NOTICE 'Curd item added successfully!';
    
END $$;

-- Verification query to show the updated drinks items
SELECT 
    'CURD ADDED TO DRINKS' as status,
    COUNT(*) as total_drinks_items
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' AND mi.category = 'Drinks';

-- Show all drinks items
SELECT 
    mi.name,
    mi.price,
    mi.is_available
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' AND mi.category = 'Drinks'
ORDER BY mi.name;
