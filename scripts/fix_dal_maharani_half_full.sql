-- Fix Dal Maharani to have Half/Full variants
-- This script removes the single Dal Maharani item and creates Half/Full variants
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
    
    RAISE NOTICE 'Fixing Dal Maharani Half/Full variants for Cook House (Cafe ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- REMOVE EXISTING DAL MAHARANI ITEMS
    -- ========================================
    
    -- Delete existing Dal Maharani items
    DELETE FROM public.menu_items 
    WHERE cafe_id = cook_house_cafe_id 
    AND (
        name ILIKE '%dal maharani%' OR 
        name ILIKE '%dal makhni%' OR
        name ILIKE '%dal makhani%'
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % existing Dal Maharani items', deleted_count;
    
    -- ========================================
    -- CREATE HALF/FULL VARIANTS
    -- ========================================
    
    -- Insert Dal Maharani with Half/Full variants
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available, is_vegetarian) VALUES
    (cook_house_cafe_id, 'Dal Maharani (Half)', 'Royal dal makhni - half portion', 190, 'Dal Darshan', true, true),
    (cook_house_cafe_id, 'Dal Maharani (Full)', 'Royal dal makhni - full portion', 260, 'Dal Darshan', true, true);
    
    RAISE NOTICE 'Created Dal Maharani Half/Full variants';
    RAISE NOTICE 'Dal Maharani variants created successfully!';
    
END $$;

-- Verification query to show Dal Maharani variants
SELECT 
    'DAL MAHARANI VARIANTS' as status,
    mi.name,
    mi.price,
    mi.category,
    mi.is_vegetarian
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.name ILIKE '%dal maharani%'
ORDER BY mi.name;
