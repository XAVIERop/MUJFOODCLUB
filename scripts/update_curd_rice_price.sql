-- Update Curd Rice price to ₹210
-- This script updates Curd Rice price from ₹70 to ₹210
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
    
    RAISE NOTICE 'Updating Curd Rice price to ₹210 (Cafe ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- UPDATE CURD RICE PRICE
    -- ========================================
    
    -- Update Curd Rice price to ₹210
    UPDATE public.menu_items 
    SET price = 210, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND name ILIKE '%curd rice%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
        RAISE NOTICE 'Updated Curd Rice price to ₹210';
    ELSE
        RAISE NOTICE 'Curd Rice item not found - may need to be created';
    END IF;
    
    RAISE NOTICE 'Curd Rice price update completed!';
    
END $$;

-- Verification query to show updated Curd Rice price
SELECT 
    'CURD RICE PRICE UPDATED' as status,
    COUNT(*) as total_curd_rice_items
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.name ILIKE '%curd rice%'
AND mi.price = 210;

-- Show Curd Rice item with current price
SELECT 
    mi.name,
    mi.price,
    mi.category,
    mi.is_available,
    CASE 
        WHEN mi.price = 210 THEN '✅ Updated to ₹210'
        ELSE '❌ Still ₹' || mi.price
    END as status
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.name ILIKE '%curd rice%'
ORDER BY mi.name;
