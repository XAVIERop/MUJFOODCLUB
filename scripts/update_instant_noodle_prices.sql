-- Update instant noodle cup prices
-- This script updates prices for Maggi, Wai Wai, and Nissin cup noodles
-- Run this in Supabase Dashboard → SQL Editor

DO $$
DECLARE
    grabit_cafe_id UUID;
    updated_count INTEGER := 0;
BEGIN
    -- Get Grabit cafe ID
    SELECT id INTO grabit_cafe_id 
    FROM public.cafes 
    WHERE LOWER(name) LIKE '%grabit%' OR LOWER(slug) = 'grabit';
    
    IF grabit_cafe_id IS NULL THEN
        RAISE EXCEPTION 'Grabit cafe not found';
    END IF;
    
    RAISE NOTICE 'Updating instant noodle prices (Cafe ID: %)', grabit_cafe_id;
    
    -- ========================================
    -- UPDATE MAGGI CUP NOODLES PRICES
    -- ========================================
    
    -- Update Maggi Masala Cuppa Noodles 70.5 g to ₹52
    UPDATE public.menu_items 
    SET price = 52, updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id 
    AND name ILIKE '%maggi%masala%cuppa%'
    AND (name ILIKE '%70.5%' OR name ILIKE '%70%5%');
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
        RAISE NOTICE 'Updated Maggi Masala Cuppa Noodles 70.5g to ₹52';
    END IF;
    
    -- Update Maggi Chilly Chow Cuppa Noodles 70 g to ₹52
    UPDATE public.menu_items 
    SET price = 52, updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id 
    AND name ILIKE '%maggi%chilly%chow%cuppa%'
    AND name ILIKE '%70%'
    AND name NOT ILIKE '%70.5%'
    AND name NOT ILIKE '%75%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
        RAISE NOTICE 'Updated Maggi Chilly Chow Cuppa Noodles 70g to ₹52';
    END IF;
    
    -- ========================================
    -- UPDATE WAI WAI CUP NOODLES PRICES
    -- ========================================
    
    -- Update Wai Wai Ready to Eat Cup Noodles Chicken 75 g to ₹60
    UPDATE public.menu_items 
    SET price = 60, updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id 
    AND name ILIKE '%wai%wai%'
    AND name ILIKE '%chicken%'
    AND (name ILIKE '%75%' OR name ILIKE '%75 g%');
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
        RAISE NOTICE 'Updated Wai Wai Ready to Eat Cup Noodles Chicken 75g to ₹60';
    END IF;
    
    -- Update Wai Wai Veg Masala Noodle Cup 70 g to ₹55
    UPDATE public.menu_items 
    SET price = 55, updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id 
    AND name ILIKE '%wai%wai%veg%masala%'
    AND name ILIKE '%70%'
    AND name NOT ILIKE '%75%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
        RAISE NOTICE 'Updated Wai Wai Veg Masala Noodle Cup 70g to ₹55';
    END IF;
    
    -- ========================================
    -- UPDATE NISSIN CUP NOODLES PRICES
    -- ========================================
    
    -- Update Nissin Cup Noodles Paneer Butter Masala 70 g to ₹55
    UPDATE public.menu_items 
    SET price = 55, updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id 
    AND name ILIKE '%nissin%'
    AND name ILIKE '%paneer%butter%masala%'
    AND name ILIKE '%70%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
        RAISE NOTICE 'Updated Nissin Cup Noodles Paneer Butter Masala 70g to ₹55';
    END IF;
    
    -- Update Nissin Cup Noodles Rich Mutton Curry 70 g to ₹55
    UPDATE public.menu_items 
    SET price = 55, updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id 
    AND name ILIKE '%nissin%'
    AND name ILIKE '%rich%mutton%curry%'
    AND name ILIKE '%70%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
        RAISE NOTICE 'Updated Nissin Cup Noodles Rich Mutton Curry 70g to ₹55';
    END IF;
    
    -- Update Nissin Cup Noodles Manchow Spicy Vegetable 70 g to ₹55
    UPDATE public.menu_items 
    SET price = 55, updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id 
    AND name ILIKE '%nissin%'
    AND name ILIKE '%manchow%spicy%vegetable%'
    AND name ILIKE '%70%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
        RAISE NOTICE 'Updated Nissin Cup Noodles Manchow Spicy Vegetable 70g to ₹55';
    END IF;
    
    -- Update Nissin Cup Noodles Mazedaar Masala Delicious Masala 70 g to ₹55
    UPDATE public.menu_items 
    SET price = 55, updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id 
    AND name ILIKE '%nissin%'
    AND name ILIKE '%mazedaar%masala%'
    AND name ILIKE '%70%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
        RAISE NOTICE 'Updated Nissin Cup Noodles Mazedaar Masala Delicious Masala 70g to ₹55';
    END IF;
    
    -- Update Nissin Cup Noodles Italian Delight 70 g to ₹55
    UPDATE public.menu_items 
    SET price = 55, updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id 
    AND name ILIKE '%nissin%'
    AND name ILIKE '%italian%delight%'
    AND name ILIKE '%70%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
        RAISE NOTICE 'Updated Nissin Cup Noodles Italian Delight 70g to ₹55';
    END IF;
    
    -- Update Nissin Cup Noodles Spiced Chicken 70 g to ₹55
    UPDATE public.menu_items 
    SET price = 55, updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id 
    AND name ILIKE '%nissin%'
    AND name ILIKE '%spiced%chicken%'
    AND name ILIKE '%70%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
        RAISE NOTICE 'Updated Nissin Cup Noodles Spiced Chicken 70g to ₹55';
    END IF;
    
    RAISE NOTICE 'Instant noodle price updates completed!';
    
END $$;

-- Verification query to show updated instant noodle prices
SELECT 
    'INSTANT NOODLE PRICES UPDATED' as status,
    COUNT(*) as total_noodles
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE (LOWER(c.name) LIKE '%grabit%' OR LOWER(c.slug) = 'grabit')
AND (
    mi.name ILIKE '%maggi%cuppa%' OR
    mi.name ILIKE '%wai%wai%cup%' OR
    mi.name ILIKE '%nissin%cup%noodles%'
);

-- Show all instant noodles with their current prices
SELECT 
    mi.name,
    mi.price,
    mi.is_available,
    CASE 
        WHEN (mi.name ILIKE '%maggi%masala%cuppa%70.5%' AND mi.price = 52) OR
             (mi.name ILIKE '%maggi%chilly%chow%cuppa%70%' AND mi.price = 52 AND mi.name NOT ILIKE '%70.5%') OR
             (mi.name ILIKE '%wai%wai%chicken%75%' AND mi.price = 60) OR
             (mi.name ILIKE '%wai%wai%veg%masala%70%' AND mi.price = 55 AND mi.name NOT ILIKE '%75%') OR
             (mi.name ILIKE '%nissin%' AND mi.price = 55 AND mi.name ILIKE '%70%')
        THEN '✅ Updated'
        ELSE '❌ Check manually'
    END as status
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE (LOWER(c.name) LIKE '%grabit%' OR LOWER(c.slug) = 'grabit')
AND (
    mi.name ILIKE '%maggi%cuppa%' OR
    mi.name ILIKE '%wai%wai%cup%' OR
    mi.name ILIKE '%nissin%cup%noodles%'
)
ORDER BY 
    CASE 
        WHEN mi.name ILIKE '%maggi%' THEN 1
        WHEN mi.name ILIKE '%wai%wai%' THEN 2
        WHEN mi.name ILIKE '%nissin%' THEN 3
        ELSE 4
    END,
    mi.name;

