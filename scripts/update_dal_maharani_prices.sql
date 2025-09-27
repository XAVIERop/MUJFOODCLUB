-- Update Dal Maharani (Dal Makhni) prices
-- This script updates Dal Maharani to have Half (₹190) and Full (₹260) variants
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
    
    RAISE NOTICE 'Updating Dal Maharani prices (Cafe ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- UPDATE DAL MAHARANI PRICES
    -- ========================================
    
    -- Update Dal Maharani (Half) price to ₹190
    UPDATE public.menu_items 
    SET price = 190, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND name ILIKE '%dal maharani%' 
    AND name ILIKE '%half%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
        RAISE NOTICE 'Updated Dal Maharani (Half) price to ₹190';
    END IF;
    
    -- Update Dal Maharani (Full) price to ₹260
    UPDATE public.menu_items 
    SET price = 260, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND name ILIKE '%dal maharani%' 
    AND name ILIKE '%full%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
        RAISE NOTICE 'Updated Dal Maharani (Full) price to ₹260';
    END IF;
    
    -- If no variants exist, create them
    IF NOT EXISTS (
        SELECT 1 FROM public.menu_items 
        WHERE cafe_id = cook_house_cafe_id 
        AND name ILIKE '%dal maharani%'
    ) THEN
        -- Insert Dal Maharani (Half) - ₹190
        INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
        (cook_house_cafe_id, 'Dal Maharani (Half)', 'Dal Makhni - Half portion', 190, 'Main Course', true);
        
        -- Insert Dal Maharani (Full) - ₹260
        INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
        (cook_house_cafe_id, 'Dal Maharani (Full)', 'Dal Makhni - Full portion', 260, 'Main Course', true);
        
        RAISE NOTICE 'Created Dal Maharani variants: Half (₹190), Full (₹260)';
    END IF;
    
    RAISE NOTICE 'Dal Maharani price updates completed!';
    
END $$;

-- Verification query to show updated Dal Maharani prices
SELECT 
    'DAL MAHARANI PRICES UPDATED' as status,
    COUNT(*) as total_variants
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.name ILIKE '%dal maharani%';

-- Show Dal Maharani items with their current prices
SELECT 
    mi.name,
    mi.price,
    mi.is_available,
    CASE 
        WHEN mi.name ILIKE '%half%' AND mi.price = 190 THEN '✅ Half Updated'
        WHEN mi.name ILIKE '%full%' AND mi.price = 260 THEN '✅ Full Updated'
        ELSE '❌ Needs Update'
    END as status
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.name ILIKE '%dal maharani%'
ORDER BY mi.name;
