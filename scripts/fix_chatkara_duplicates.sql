-- Fix duplicate items in Chatkara menu
-- This script removes duplicate Chatkara entries and keeps only the correct ones
-- Run this in Supabase Dashboard → SQL Editor

DO $$
DECLARE
    chatkara_cafe_id UUID;
    deleted_count INTEGER := 0;
BEGIN
    -- Get Chatkara cafe ID
    SELECT id INTO chatkara_cafe_id FROM public.cafes WHERE name = 'CHATKARA';
    
    IF chatkara_cafe_id IS NULL THEN
        RAISE EXCEPTION 'Chatkara cafe not found';
    END IF;
    
    RAISE NOTICE 'Fixing Chatkara duplicates (Cafe ID: %)', chatkara_cafe_id;
    
    -- ========================================
    -- REMOVE DUPLICATE CHATKARA ITEMS
    -- ========================================
    
    -- Delete duplicate Chatkara items, keeping only one of each
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
            WHERE c.name = 'CHATKARA'
        ) t
        WHERE t.rn > 1
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % duplicate Chatkara items', deleted_count;
    
    RAISE NOTICE 'Chatkara duplicates fixed successfully!';
    
END $$;

-- Verification query to show final Chatkara structure
SELECT 
    'FINAL CHATKARA STRUCTURE' as status,
    mi.category,
    COUNT(*) as total_items
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'CHATKARA' 
GROUP BY mi.category
ORDER BY mi.category;
