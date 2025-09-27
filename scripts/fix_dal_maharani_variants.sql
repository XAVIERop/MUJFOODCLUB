-- Fix Dal Maharani to have Half/Full variants
-- This script splits the single Dal Maharani item into Half (₹190) and Full (₹260) variants
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
    
    RAISE NOTICE 'Fixing Dal Maharani variants (Cafe ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- DELETE EXISTING SINGLE ITEM
    -- ========================================
    
    -- Delete the existing single Dal Maharani item
    DELETE FROM public.menu_items 
    WHERE cafe_id = cook_house_cafe_id 
    AND name ILIKE '%dal maharani%';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    IF deleted_count > 0 THEN
        RAISE NOTICE 'Deleted % existing Dal Maharani item(s)', deleted_count;
    END IF;
    
    -- ========================================
    -- INSERT HALF/FULL VARIANTS
    -- ========================================
    
    -- Insert Dal Maharani (Half) - ₹190
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Dal Maharani (Half)', 'Dal Makhni - Half portion', 190, 'Main Course', true);
    
    -- Insert Dal Maharani (Full) - ₹260
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Dal Maharani (Full)', 'Dal Makhni - Full portion', 260, 'Main Course', true);
    
    RAISE NOTICE 'Created Dal Maharani variants: Half (₹190), Full (₹260)';
    RAISE NOTICE 'Dal Maharani variants created successfully!';
    
END $$;

-- Verification query to show the new Dal Maharani variants
SELECT 
    'DAL MAHARANI VARIANTS CREATED' as status,
    COUNT(*) as total_variants
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.name ILIKE '%dal maharani%';

-- Show Dal Maharani items with their prices
SELECT 
    mi.name,
    mi.price,
    mi.is_available,
    CASE 
        WHEN mi.name ILIKE '%half%' AND mi.price = 190 THEN '✅ Half - ₹190'
        WHEN mi.name ILIKE '%full%' AND mi.price = 260 THEN '✅ Full - ₹260'
        ELSE '❌ Check price'
    END as status
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.name ILIKE '%dal maharani%'
ORDER BY mi.name;
