-- Move Dal Maharani from Main Course to Dal Darshan section
-- This script moves Dal Maharani variants from Main Course to Dal Darshan category
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
    
    RAISE NOTICE 'Moving Dal Maharani to Dal Darshan section (Cafe ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- MOVE DAL MAHARANI TO DAL DARSHAN
    -- ========================================
    
    -- Update Dal Maharani (Half) category to Dal Darshan
    UPDATE public.menu_items 
    SET category = 'Dal Darshan', updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND name ILIKE '%dal maharani%' 
    AND name ILIKE '%half%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
        RAISE NOTICE 'Moved Dal Maharani (Half) to Dal Darshan section';
    END IF;
    
    -- Update Dal Maharani (Full) category to Dal Darshan
    UPDATE public.menu_items 
    SET category = 'Dal Darshan', updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND name ILIKE '%dal maharani%' 
    AND name ILIKE '%full%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
        RAISE NOTICE 'Moved Dal Maharani (Full) to Dal Darshan section';
    END IF;
    
    RAISE NOTICE 'Dal Maharani moved to Dal Darshan section successfully!';
    
END $$;

-- Verification query to show Dal Maharani in Dal Darshan section
SELECT 
    'DAL MAHARANI MOVED TO DAL DARSHAN' as status,
    COUNT(*) as total_dal_maharani_items
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.name ILIKE '%dal maharani%'
AND mi.category = 'Dal Darshan';

-- Show Dal Maharani items with their new category
SELECT 
    mi.name,
    mi.price,
    mi.category,
    mi.is_available,
    CASE 
        WHEN mi.category = 'Dal Darshan' THEN '✅ Moved to Dal Darshan'
        ELSE '❌ Still in ' || mi.category
    END as status
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.name ILIKE '%dal maharani%'
ORDER BY mi.name;
