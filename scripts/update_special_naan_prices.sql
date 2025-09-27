-- Update special naan prices
-- This script updates Cheese Naan, Cheese Garlic Naan, and Chur Chur Naan prices
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
    
    RAISE NOTICE 'Updating special naan prices (Cafe ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- UPDATE SPECIAL NAAN PRICES
    -- ========================================
    
    -- Update Cheese Naan price to ₹90
    UPDATE public.menu_items 
    SET price = 90, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND name ILIKE '%cheese naan%'
    AND name NOT ILIKE '%garlic%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
        RAISE NOTICE 'Updated Cheese Naan price to ₹90';
    END IF;
    
    -- Update Cheese Garlic Naan price to ₹110
    UPDATE public.menu_items 
    SET price = 110, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND name ILIKE '%cheese garlic naan%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
        RAISE NOTICE 'Updated Cheese Garlic Naan price to ₹110';
    END IF;
    
    -- Update Chur Chur Naan price to ₹80
    UPDATE public.menu_items 
    SET price = 80, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND name ILIKE '%chur chur naan%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
        RAISE NOTICE 'Updated Chur Chur Naan price to ₹80';
    END IF;
    
    -- If items don't exist, create them
    IF NOT EXISTS (
        SELECT 1 FROM public.menu_items 
        WHERE cafe_id = cook_house_cafe_id 
        AND name ILIKE '%cheese naan%'
        AND name NOT ILIKE '%garlic%'
    ) THEN
        INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
        (cook_house_cafe_id, 'Cheese Naan', 'Naan with cheese', 90, 'Breads', true);
        RAISE NOTICE 'Created Cheese Naan - ₹90';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM public.menu_items 
        WHERE cafe_id = cook_house_cafe_id 
        AND name ILIKE '%cheese garlic naan%'
    ) THEN
        INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
        (cook_house_cafe_id, 'Cheese Garlic Naan', 'Naan with cheese and garlic', 110, 'Breads', true);
        RAISE NOTICE 'Created Cheese Garlic Naan - ₹110';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM public.menu_items 
        WHERE cafe_id = cook_house_cafe_id 
        AND name ILIKE '%chur chur naan%'
    ) THEN
        INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
        (cook_house_cafe_id, 'Chur Chur Naan', 'Crispy layered naan', 80, 'Breads', true);
        RAISE NOTICE 'Created Chur Chur Naan - ₹80';
    END IF;
    
    RAISE NOTICE 'Special naan price updates completed!';
    
END $$;

-- Verification query to show updated special naan prices
SELECT 
    'SPECIAL NAAN PRICES UPDATED' as status,
    COUNT(*) as total_special_naans
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Breads'
AND (mi.name ILIKE '%cheese naan%' OR mi.name ILIKE '%chur chur naan%');

-- Show special naan items with their current prices
SELECT 
    mi.name,
    mi.price,
    mi.is_available,
    CASE 
        WHEN mi.name ILIKE '%cheese naan%' AND mi.name NOT ILIKE '%garlic%' AND mi.price = 90 THEN '✅ Cheese Naan - ₹90'
        WHEN mi.name ILIKE '%cheese garlic naan%' AND mi.price = 110 THEN '✅ Cheese Garlic Naan - ₹110'
        WHEN mi.name ILIKE '%chur chur naan%' AND mi.price = 80 THEN '✅ Chur Chur Naan - ₹80'
        ELSE '❌ Check price - ₹' || mi.price
    END as status
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Breads'
AND (mi.name ILIKE '%cheese naan%' OR mi.name ILIKE '%chur chur naan%')
ORDER BY mi.name;
