-- Fix Momos and other items to have separate Veg/Non-veg and Dry/Gravy variants
-- This script splits items into separate variants for frontend grouping
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
    
    RAISE NOTICE 'Fixing Momos and other variants (ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- 1. REMOVE EXISTING COMBINED ITEMS
    -- ========================================
    
    -- Remove existing combined items
    DELETE FROM public.menu_items 
    WHERE cafe_id = cook_house_cafe_id 
    AND name IN (
        'Steam Momos (6 pcs)',
        'Fried Momos (6 pcs)',
        'Crispy Chilly Paneer (Dry/Gravy)',
        'Veg Manchurian (Dry/Gravy)'
    );
    
    RAISE NOTICE 'Removed 4 combined items';
    
    -- ========================================
    -- 2. ADD SEPARATE MOMOS VARIANTS
    -- ========================================
    
    -- Steam Momos: Veg ₹130, Non-veg ₹200
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Steam Momos (6 pcs) (Veg)', 'Steamed vegetable momos - 6 pieces', 130, 'China Wall', true),
    (cook_house_cafe_id, 'Steam Momos (6 pcs) (Non-veg)', 'Steamed non-vegetarian momos - 6 pieces', 200, 'China Wall', true);
    
    -- Fried Momos: Veg ₹140, Non-veg ₹200
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Fried Momos (6 pcs) (Veg)', 'Fried vegetable momos - 6 pieces', 140, 'China Wall', true),
    (cook_house_cafe_id, 'Fried Momos (6 pcs) (Non-veg)', 'Fried non-vegetarian momos - 6 pieces', 200, 'China Wall', true);
    
    -- ========================================
    -- 3. ADD SEPARATE DRY/GRAVY VARIANTS
    -- ========================================
    
    -- Crispy Chilli Paneer: Dry ₹260, Gravy ₹260 (same price for both)
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Crispy Chilli Paneer (Dry)', 'Crispy paneer in chili sauce - dry', 260, 'China Wall', true),
    (cook_house_cafe_id, 'Crispy Chilli Paneer (Gravy)', 'Crispy paneer in chili sauce - gravy', 260, 'China Wall', true);
    
    -- Veg Manchurian: Dry ₹180, Gravy ₹200
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Veg Manchurian (Dry)', 'Vegetable manchurian - dry', 180, 'China Wall', true),
    (cook_house_cafe_id, 'Veg Manchurian (Gravy)', 'Vegetable manchurian - gravy', 200, 'China Wall', true);
    
    RAISE NOTICE 'Added 8 separate variant items';
    
    -- ========================================
    -- 4. VERIFICATION
    -- ========================================
    
    -- Count China Wall items
    DECLARE
        china_wall_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO china_wall_count 
        FROM public.menu_items 
        WHERE cafe_id = cook_house_cafe_id 
        AND category = 'China Wall';
        
        RAISE NOTICE 'Total China Wall items after fix: %', china_wall_count;
    END;
    
    RAISE NOTICE 'Momos and variants fix completed successfully!';
    
END $$;

-- Verification query to show the updated items
SELECT 
    'MOMOS AND VARIANTS FIX COMPLETE' as status,
    COUNT(*) as total_china_wall_items
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' AND mi.category = 'China Wall';

-- Show all momos and variant items
SELECT 
    mi.name,
    mi.price,
    mi.is_available
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND (
    mi.name ILIKE '%momo%' 
    OR mi.name ILIKE '%manchurian%' 
    OR mi.name ILIKE '%crispy%paneer%'
)
ORDER BY mi.name;
