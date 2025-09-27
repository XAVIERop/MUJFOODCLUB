-- Update soft drink prices to ₹20
-- This script updates Coke, Fanta, Mirinda, and Sprite prices to ₹20
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
    
    RAISE NOTICE 'Updating soft drink prices to ₹20 (Cafe ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- UPDATE SOFT DRINK PRICES
    -- ========================================
    
    -- Update Coke price to ₹20
    UPDATE public.menu_items 
    SET price = 20, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND name ILIKE '%coke%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
        RAISE NOTICE 'Updated Coke price to ₹20';
    END IF;
    
    -- Update Fanta price to ₹20
    UPDATE public.menu_items 
    SET price = 20, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND name ILIKE '%fanta%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
        RAISE NOTICE 'Updated Fanta price to ₹20';
    END IF;
    
    -- Update Mirinda price to ₹20
    UPDATE public.menu_items 
    SET price = 20, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND name ILIKE '%mirinda%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
        RAISE NOTICE 'Updated Mirinda price to ₹20';
    END IF;
    
    -- Update Sprite price to ₹20
    UPDATE public.menu_items 
    SET price = 20, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND name ILIKE '%sprite%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
        RAISE NOTICE 'Updated Sprite price to ₹20';
    END IF;
    
    RAISE NOTICE 'Soft drink price updates completed!';
    
END $$;

-- Verification query to show updated soft drink prices
SELECT 
    'SOFT DRINK PRICES UPDATED' as status,
    COUNT(*) as total_soft_drinks
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND (mi.name ILIKE '%coke%' OR mi.name ILIKE '%fanta%' OR mi.name ILIKE '%mirinda%' OR mi.name ILIKE '%sprite%')
AND mi.price = 20;

-- Show all soft drinks with their current prices
SELECT 
    mi.name,
    mi.price,
    mi.is_available,
    CASE 
        WHEN mi.price = 20 THEN '✅ Updated'
        ELSE '❌ Not updated'
    END as status
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND (mi.name ILIKE '%coke%' OR mi.name ILIKE '%fanta%' OR mi.name ILIKE '%mirinda%' OR mi.name ILIKE '%sprite%')
ORDER BY mi.name;
