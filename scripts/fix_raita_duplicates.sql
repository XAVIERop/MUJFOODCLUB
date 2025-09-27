-- Fix raita duplicates
-- This script removes duplicate raita items and keeps only unique ones
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
    
    RAISE NOTICE 'Fixing raita duplicates (Cafe ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- DELETE DUPLICATE RAITA ITEMS
    -- ========================================
    
    -- Delete duplicate raita items, keeping only one of each
    -- Using a subquery to keep the first occurrence (lowest ID)
    DELETE FROM public.menu_items 
    WHERE cafe_id = cook_house_cafe_id 
    AND category = 'Raita'
    AND id NOT IN (
        SELECT MIN(id) 
        FROM public.menu_items 
        WHERE cafe_id = cook_house_cafe_id 
        AND category = 'Raita'
        GROUP BY name, price
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    IF deleted_count > 0 THEN
        RAISE NOTICE 'Deleted % duplicate raita items', deleted_count;
    END IF;
    
    -- Also fix the Mix Veg Raita naming inconsistency
    UPDATE public.menu_items 
    SET name = 'Mix Veg Raita', updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND category = 'Raita'
    AND name = 'Mix veg Raita';
    
    RAISE NOTICE 'Raita duplicates fixed successfully!';
    
END $$;

-- Verification query to show remaining raita items
SELECT 
    'RAITA DUPLICATES FIXED' as status,
    COUNT(*) as total_raita_items
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Raita';

-- Show all remaining raita items
SELECT 
    mi.name,
    mi.price,
    mi.is_available,
    '✅ Unique Raita' as status
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Raita'
ORDER BY mi.name;
