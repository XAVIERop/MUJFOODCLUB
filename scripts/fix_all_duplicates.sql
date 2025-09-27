-- Fix ALL duplicate items in Cook House across all categories
-- This script removes ALL duplicate entries and keeps only one of each
-- Run this in Supabase Dashboard → SQL Editor

DO $$
DECLARE
    cook_house_cafe_id UUID;
    deleted_count INTEGER := 0;
    total_deleted INTEGER := 0;
BEGIN
    -- Get Cook House cafe ID
    SELECT id INTO cook_house_cafe_id FROM public.cafes WHERE name = 'COOK HOUSE';
    
    IF cook_house_cafe_id IS NULL THEN
        RAISE EXCEPTION 'Cook House cafe not found';
    END IF;
    
    RAISE NOTICE 'Fixing ALL duplicates for Cook House (Cafe ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- REMOVE ALL DUPLICATE ITEMS
    -- ========================================
    
    -- Delete ALL duplicate items, keeping only one of each
    DELETE FROM public.menu_items 
    WHERE id IN (
        SELECT t.menu_item_id FROM (
            SELECT mi.id as menu_item_id, 
                   ROW_NUMBER() OVER (
                       PARTITION BY mi.name, mi.price, mi.is_vegetarian, mi.category
                       ORDER BY mi.created_at
                   ) as rn
            FROM public.menu_items mi
            JOIN public.cafes c ON mi.cafe_id = c.id
            WHERE c.name = 'COOK HOUSE'
        ) t
        WHERE t.rn > 1
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % duplicate items (by name/price/veg/category)', deleted_count;
    
    -- Also delete duplicates by name only (keeping the first occurrence)
    DELETE FROM public.menu_items 
    WHERE id IN (
        SELECT t.menu_item_id FROM (
            SELECT mi.id as menu_item_id, 
                   ROW_NUMBER() OVER (
                       PARTITION BY mi.name, mi.category
                       ORDER BY mi.created_at
                   ) as rn
            FROM public.menu_items mi
            JOIN public.cafes c ON mi.cafe_id = c.id
            WHERE c.name = 'COOK HOUSE'
        ) t
        WHERE t.rn > 1
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % additional duplicate items (by name/category)', deleted_count;
    
    RAISE NOTICE 'Total duplicates deleted: %', total_deleted;
    RAISE NOTICE 'All duplicates fixed successfully!';
    
END $$;

-- Verification query to show final structure
SELECT 
    'FINAL STRUCTURE - ITEMS PER CATEGORY' as status,
    mi.category,
    COUNT(*) as total_items
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
GROUP BY mi.category
ORDER BY mi.category;
