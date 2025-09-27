-- Fix Keema Pao to have separate Chicken and Mutton variants
-- This script splits the combined item into two separate items for frontend grouping
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
    
    RAISE NOTICE 'Fixing Keema Pao variants (ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- 1. REMOVE EXISTING COMBINED ITEM
    -- ========================================
    
    -- Remove the combined Keema Pao item
    DELETE FROM public.menu_items 
    WHERE cafe_id = cook_house_cafe_id 
    AND name = 'Keema Pao (Chicken/Mutton)';
    
    RAISE NOTICE 'Removed combined Keema Pao item';
    
    -- ========================================
    -- 2. ADD SEPARATE CHICKEN AND MUTTON ITEMS
    -- ========================================
    
    -- Add separate Keema Pao items with correct pricing
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Keema Pao (Chicken)', 'Keema pao - chicken', 190, 'Bun Muska', true),
    (cook_house_cafe_id, 'Keema Pao (Mutton)', 'Keema pao - mutton', 210, 'Bun Muska', true);
    
    RAISE NOTICE 'Added separate Keema Pao items: Chicken ₹190, Mutton ₹210';
    
    -- ========================================
    -- 3. VERIFICATION
    -- ========================================
    
    -- Count Keema Pao items
    DECLARE
        keema_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO keema_count 
        FROM public.menu_items 
        WHERE cafe_id = cook_house_cafe_id 
        AND name ILIKE '%keema%pao%';
        
        RAISE NOTICE 'Total Keema Pao items after fix: %', keema_count;
    END;
    
    RAISE NOTICE 'Keema Pao variants fix completed successfully!';
    
END $$;

-- Verification query to show the updated Keema Pao items
SELECT 
    'KEEMA PAO VARIANTS FIX COMPLETE' as status,
    COUNT(*) as total_keema_items
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' AND mi.name ILIKE '%keema%pao%';

-- Show all Keema Pao items with their prices
SELECT 
    mi.name,
    mi.price,
    mi.is_available
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' AND mi.name ILIKE '%keema%pao%'
ORDER BY mi.name;
