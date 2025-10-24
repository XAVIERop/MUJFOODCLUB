-- Fix remaining Chatkara items that were missed
-- Run this in Supabase Dashboard → SQL Editor

DO $$
DECLARE
    chatkara_cafe_id UUID;
    updated_count INTEGER := 0;
BEGIN
    -- Get Chatkara cafe ID
    SELECT id INTO chatkara_cafe_id FROM public.cafes WHERE name = 'CHATKARA';
    
    IF chatkara_cafe_id IS NULL THEN
        RAISE EXCEPTION 'Chatkara cafe not found';
    END IF;
    
    RAISE NOTICE 'Found Chatkara cafe with ID: %', chatkara_cafe_id;
    
    -- Fix "Chicken Steam Momos" specifically
    UPDATE public.menu_items 
    SET is_vegetarian = false, updated_at = NOW()
    WHERE cafe_id = chatkara_cafe_id 
    AND name = 'Chicken Steam Momos';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Fixed Chicken Steam Momos: % rows updated', updated_count;
    
    -- Double-check: Fix any remaining chicken items that don't start with "Veg"
    UPDATE public.menu_items 
    SET is_vegetarian = false, updated_at = NOW()
    WHERE cafe_id = chatkara_cafe_id 
    AND name ILIKE '%chicken%'
    AND name NOT ILIKE 'veg%' -- Don't touch items starting with "veg"
    AND is_vegetarian = true;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Fixed remaining chicken items: % rows updated', updated_count;
    
    -- Final summary
    RAISE NOTICE '=== FINAL STATUS ===';
    RAISE NOTICE 'Total items: %', (SELECT COUNT(*) FROM public.menu_items WHERE cafe_id = chatkara_cafe_id);
    RAISE NOTICE 'Vegetarian items: %', (SELECT COUNT(*) FROM public.menu_items WHERE cafe_id = chatkara_cafe_id AND is_vegetarian = true);
    RAISE NOTICE 'Non-vegetarian items: %', (SELECT COUNT(*) FROM public.menu_items WHERE cafe_id = chatkara_cafe_id AND is_vegetarian = false);
    
END $$;
