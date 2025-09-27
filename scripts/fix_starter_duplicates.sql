-- Fix duplicate starter items in Cook House
-- This script removes duplicate starter entries and keeps only the correct ones
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
    
    RAISE NOTICE 'Fixing starter duplicates for Cook House (Cafe ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- REMOVE DUPLICATE STARTER ITEMS
    -- ========================================
    
    -- Delete duplicate starter items, keeping only one of each
    DELETE FROM public.menu_items 
    WHERE id IN (
        SELECT t.menu_item_id FROM (
            SELECT mi.id as menu_item_id, 
                   ROW_NUMBER() OVER (
                       PARTITION BY mi.name, mi.price, mi.is_vegetarian 
                       ORDER BY mi.created_at
                   ) as rn
            FROM public.menu_items mi
            JOIN public.cafes c ON mi.cafe_id = c.id
            WHERE c.name = 'COOK HOUSE' 
            AND mi.category = 'Starters'
        ) t
        WHERE t.rn > 1
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % duplicate starter items', deleted_count;
    
    RAISE NOTICE 'Starter duplicates fixed successfully!';
    
END $$;

-- Verification query to show final starter structure
SELECT 
    'FINAL STARTER STRUCTURE' as status,
    mi.name,
    mi.price,
    mi.is_vegetarian,
    CASE 
        WHEN mi.is_vegetarian = true THEN '✅ Vegetarian'
        ELSE '❌ Non-Vegetarian'
    END as classification
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Starters'
ORDER BY mi.name, mi.is_vegetarian;
