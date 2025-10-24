-- Fix Chatkara veg/non-veg classification carefully
-- Run this in Supabase Dashboard → SQL Editor

DO $$
DECLARE
    chatkara_cafe_id UUID;
    updated_count INTEGER := 0;
    rec RECORD;
BEGIN
    -- Get Chatkara cafe ID
    SELECT id INTO chatkara_cafe_id FROM public.cafes WHERE name = 'CHATKARA';
    
    IF chatkara_cafe_id IS NULL THEN
        RAISE EXCEPTION 'Chatkara cafe not found';
    END IF;
    
    RAISE NOTICE 'Found Chatkara cafe with ID: %', chatkara_cafe_id;
    
    -- ========================================
    -- MARK NON-VEGETARIAN ITEMS (Chicken, Egg, Mutton)
    -- ========================================
    
    -- Chicken items (should be non-veg)
    UPDATE public.menu_items 
    SET is_vegetarian = false, updated_at = NOW()
    WHERE cafe_id = chatkara_cafe_id 
    AND (
        name ILIKE '%chicken%' OR
        name ILIKE '%chilli chicken%'
    )
    AND name NOT ILIKE '%veg.%' -- Keep "Veg. Chicken" items as vegetarian
    AND name NOT ILIKE '%veg %'; -- Keep "Veg Chicken" items as vegetarian
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % chicken items to non-vegetarian', updated_count;
    
    -- Fix any remaining chicken items that might have been missed
    UPDATE public.menu_items 
    SET is_vegetarian = false, updated_at = NOW()
    WHERE cafe_id = chatkara_cafe_id 
    AND name ILIKE '%chicken%'
    AND name NOT ILIKE '%veg.%'
    AND name NOT ILIKE '%veg %'
    AND is_vegetarian = true; -- Only update if still marked as veg
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Fixed % remaining chicken items', updated_count;
    
    -- Egg items (should be non-veg)
    UPDATE public.menu_items 
    SET is_vegetarian = false, updated_at = NOW()
    WHERE cafe_id = chatkara_cafe_id 
    AND name ILIKE '%egg%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % egg items to non-vegetarian', updated_count;
    
    -- Mutton items (should be non-veg)
    UPDATE public.menu_items 
    SET is_vegetarian = false, updated_at = NOW()
    WHERE cafe_id = chatkara_cafe_id 
    AND (
        name ILIKE '%mutton%' OR
        name ILIKE '%lamb%'
    )
    AND name NOT ILIKE '%veg.%'; -- Keep "Veg. Mutton" items as vegetarian
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % mutton items to non-vegetarian', updated_count;
    
    -- ========================================
    -- ENSURE VEGETARIAN ITEMS ARE CORRECTLY MARKED
    -- ========================================
    
    -- "Veg." items should be vegetarian (these are veg versions of non-veg dishes)
    UPDATE public.menu_items 
    SET is_vegetarian = true, updated_at = NOW()
    WHERE cafe_id = chatkara_cafe_id 
    AND name ILIKE '%veg.%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Ensured % "Veg." items are marked as vegetarian', updated_count;
    
    -- Clear vegetarian items (paneer, dal, aloo, etc.)
    UPDATE public.menu_items 
    SET is_vegetarian = true, updated_at = NOW()
    WHERE cafe_id = chatkara_cafe_id 
    AND (
        name ILIKE '%paneer%' OR
        name ILIKE '%dal%' OR
        name ILIKE '%aloo%' OR
        name ILIKE '%rajma%' OR
        name ILIKE '%chola%' OR
        name ILIKE '%corn%' OR
        name ILIKE '%cheese%' OR
        name ILIKE '%biryani%' OR
        name ILIKE '%pasta%' OR
        name ILIKE '%lemonade%' OR
        name ILIKE '%mojito%' OR
        name ILIKE '%shake%' OR
        name ILIKE '%coffee%' OR
        name ILIKE '%tea%' OR
        name ILIKE '%water%' OR
        name ILIKE '%juice%'
    );
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Ensured % clear vegetarian items are marked as vegetarian', updated_count;
    
    -- ========================================
    -- FINAL SUMMARY
    -- ========================================
    
    RAISE NOTICE '=== FINAL CHATKARA CLASSIFICATION ===';
    RAISE NOTICE 'Total items: %', (SELECT COUNT(*) FROM public.menu_items WHERE cafe_id = chatkara_cafe_id);
    RAISE NOTICE 'Vegetarian items: %', (SELECT COUNT(*) FROM public.menu_items WHERE cafe_id = chatkara_cafe_id AND is_vegetarian = true);
    RAISE NOTICE 'Non-vegetarian items: %', (SELECT COUNT(*) FROM public.menu_items WHERE cafe_id = chatkara_cafe_id AND is_vegetarian = false);
    RAISE NOTICE 'Null items: %', (SELECT COUNT(*) FROM public.menu_items WHERE cafe_id = chatkara_cafe_id AND is_vegetarian IS NULL);
    
    -- Show sample of each category
    RAISE NOTICE 'Sample vegetarian items:';
    FOR rec IN 
        SELECT name, category 
        FROM public.menu_items 
        WHERE cafe_id = chatkara_cafe_id AND is_vegetarian = true 
        LIMIT 5
    LOOP
        RAISE NOTICE '  - % (%)', rec.name, rec.category;
    END LOOP;
    
    RAISE NOTICE 'Sample non-vegetarian items:';
    FOR rec IN 
        SELECT name, category 
        FROM public.menu_items 
        WHERE cafe_id = chatkara_cafe_id AND is_vegetarian = false 
        LIMIT 5
    LOOP
        RAISE NOTICE '  - % (%)', rec.name, rec.category;
    END LOOP;
    
END $$;
