-- Fix paratha duplicates
-- This script removes duplicate paratha items and keeps only the properly named ones
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
    
    RAISE NOTICE 'Fixing paratha duplicates (Cafe ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- DELETE DUPLICATE PARATHA ITEMS
    -- ========================================
    
    -- Delete items with inconsistent naming (keeping the ones with proper parentheses)
    DELETE FROM public.menu_items 
    WHERE cafe_id = cook_house_cafe_id 
    AND category = 'Breads'
    AND (
        name = 'Aloo Paratha - 2pcs' OR
        name = 'Aloo Pyaaz Paratha - 2pcs' OR
        name = 'Cheese Corn Paratha -2pcs' OR
        name = 'Gobhi Paratha -2pcs' OR
        name = 'Mix Paratha -2pcs' OR
        name = 'Onion Cheese Paratha -2pcs' OR
        name = 'Paneer Onion Paratha - 2pcs'
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    IF deleted_count > 0 THEN
        RAISE NOTICE 'Deleted % duplicate paratha items', deleted_count;
    END IF;
    
    RAISE NOTICE 'Paratha duplicates fixed successfully!';
    
END $$;

-- Verification query to show remaining paratha items
SELECT 
    'PARATHA DUPLICATES FIXED' as status,
    COUNT(*) as total_parathas
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Breads'
AND mi.name ILIKE '%paratha%';

-- Show all remaining paratha items
SELECT 
    mi.name,
    mi.price,
    mi.is_available,
    CASE 
        WHEN mi.name ILIKE '%(2pcs)%' THEN '✅ Regular Paratha'
        WHEN mi.name ILIKE '%(plain)%' OR mi.name ILIKE '%(butter)%' THEN '✅ Laccha Paratha Variant'
        ELSE '❌ Check naming'
    END as item_type
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Breads'
AND mi.name ILIKE '%paratha%'
ORDER BY 
    CASE 
        WHEN mi.name ILIKE '%laccha%' THEN 1
        WHEN mi.name ILIKE '%aloo%' THEN 2
        WHEN mi.name ILIKE '%aloo pyaaz%' THEN 3
        WHEN mi.name ILIKE '%cheese corn%' THEN 4
        WHEN mi.name ILIKE '%gobhi%' THEN 5
        WHEN mi.name ILIKE '%mix%' THEN 6
        WHEN mi.name ILIKE '%onion cheese%' THEN 7
        WHEN mi.name ILIKE '%paneer onion%' THEN 8
        ELSE 9
    END,
    mi.name;
