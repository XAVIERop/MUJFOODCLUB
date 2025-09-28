-- Fix Chatkara Indian Combos to have proper Half/Full variants
-- This script removes single combo items and creates proper Half/Full variants
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
    
    RAISE NOTICE 'Fixing Chatkara Indian Combos variants (Cafe ID: %)', chatkara_cafe_id;
    
    -- ========================================
    -- DELETE EXISTING SINGLE COMBO ITEMS
    -- ========================================
    
    -- Delete existing single combo items that should have variants
    DELETE FROM public.menu_items 
    WHERE cafe_id = chatkara_cafe_id 
    AND category = 'Indian - Combos'
    AND name IN (
        'Daal Makhani',
        'Kadhai Paneer', 
        'Paneer Butter Masala',
        'Paneer Lababdar',
        'Shahi Paneer'
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % single combo items', deleted_count;
    
    -- ========================================
    -- INSERT PROPER HALF/FULL VARIANTS
    -- ========================================
    
    -- Daal Makhani: Half ₹190, Full ₹320
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available, is_vegetarian) VALUES
    (chatkara_cafe_id, 'Daal Makhani (Half)', 'Creamy dal makhani combo - Half portion', 190, 'Indian - Combos', true, true),
    (chatkara_cafe_id, 'Daal Makhani (Full)', 'Creamy dal makhani combo - Full portion', 320, 'Indian - Combos', true, true);
    
    -- Kadhai Paneer: Half ₹240, Full ₹360  
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available, is_vegetarian) VALUES
    (chatkara_cafe_id, 'Kadhai Paneer (Half)', 'Kadhai-style paneer combo - Half portion', 240, 'Indian - Combos', true, true),
    (chatkara_cafe_id, 'Kadhai Paneer (Full)', 'Kadhai-style paneer combo - Full portion', 360, 'Indian - Combos', true, true);
    
    -- Paneer Butter Masala: Half ₹240, Full ₹360
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available, is_vegetarian) VALUES
    (chatkara_cafe_id, 'Paneer Butter Masala (Half)', 'Creamy paneer butter masala combo - Half portion', 240, 'Indian - Combos', true, true),
    (chatkara_cafe_id, 'Paneer Butter Masala (Full)', 'Creamy paneer butter masala combo - Full portion', 360, 'Indian - Combos', true, true);
    
    -- Paneer Lababdar: Half ₹240, Full ₹360
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available, is_vegetarian) VALUES
    (chatkara_cafe_id, 'Paneer Lababdar (Half)', 'Rich paneer lababdar combo - Half portion', 240, 'Indian - Combos', true, true),
    (chatkara_cafe_id, 'Paneer Lababdar (Full)', 'Rich paneer lababdar combo - Full portion', 360, 'Indian - Combos', true, true);
    
    -- Shahi Paneer: Half ₹240, Full ₹360
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available, is_vegetarian) VALUES
    (chatkara_cafe_id, 'Shahi Paneer (Half)', 'Royal shahi paneer combo - Half portion', 240, 'Indian - Combos', true, true),
    (chatkara_cafe_id, 'Shahi Paneer (Full)', 'Royal shahi paneer combo - Full portion', 360, 'Indian - Combos', true, true);
    
    RAISE NOTICE 'Created Half/Full variants for Indian Combos';
    RAISE NOTICE 'Chatkara Indian Combos variants fixed successfully!';
    
END $$;

-- Verification query to show final Indian Combos structure
SELECT 
    'FINAL CHATKARA INDIAN COMBOS' as status,
    mi.name,
    mi.price,
    mi.is_vegetarian
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'CHATKARA' 
AND mi.category = 'Indian - Combos'
ORDER BY mi.name;
