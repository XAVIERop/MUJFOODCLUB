-- Fix Pasta items to have separate Veg and Non-veg variants
-- This script splits pasta items into separate Veg/Non-veg variants for frontend grouping
-- Run this in Supabase Dashboard → SQL Editor

DO $$
DECLARE
    cook_house_cafe_id UUID;
BEGIN
    -- Get Cook House cafe ID
    SELECT id INTO cook_house_cafe_id FROM public.cafes WHERE name = 'COOK HOUSE';
    
    IF cook_house_cafe_id IS NULL THEN
        RAISE EXCEPTION 'Cook House cafe not found';
    END IF;
    
    RAISE NOTICE 'Fixing Pasta variants (ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- 1. REMOVE EXISTING SINGLE PRICE PASTA ITEMS
    -- ========================================
    
    -- Remove the existing single-price pasta items
    DELETE FROM public.menu_items 
    WHERE cafe_id = cook_house_cafe_id 
    AND category = 'Pastas'
    AND name IN (
        'Penne-al-Arrabiata (Red)',
        'Penne Pasta Alfredo (White)',
        'Pink Sauce Pasta',
        'Spaghetti Aglio E Olio',
        'Penne Pasta Pesto Sauce',
        'Mac & Cheese',
        'Spaghetti Pesto Sauce'
    );
    
    RAISE NOTICE 'Removed 7 single-price pasta items';
    
    -- ========================================
    -- 2. ADD SEPARATE VEG AND NON-VEG PASTA ITEMS
    -- ========================================
    
    -- Add separate pasta items with Veg and Non-veg pricing
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    -- Penne-al-Arrabiata (Red): Veg ₹180, Non-veg ₹210
    (cook_house_cafe_id, 'Penne-al-Arrabiata (Red) (Veg)', 'Penne arrabiata - red sauce - vegetarian', 180, 'Pastas', true),
    (cook_house_cafe_id, 'Penne-al-Arrabiata (Red) (Non-veg)', 'Penne arrabiata - red sauce - non-vegetarian', 210, 'Pastas', true),
    
    -- Penne Pasta Alfredo (White): Veg ₹180, Non-veg ₹210
    (cook_house_cafe_id, 'Penne Pasta Alfredo (White) (Veg)', 'Penne pasta alfredo - white sauce - vegetarian', 180, 'Pastas', true),
    (cook_house_cafe_id, 'Penne Pasta Alfredo (White) (Non-veg)', 'Penne pasta alfredo - white sauce - non-vegetarian', 210, 'Pastas', true),
    
    -- Pink Sauce Pasta: Veg ₹180, Non-veg ₹210
    (cook_house_cafe_id, 'Pink Sauce Pasta (Veg)', 'Pink sauce pasta - vegetarian', 180, 'Pastas', true),
    (cook_house_cafe_id, 'Pink Sauce Pasta (Non-veg)', 'Pink sauce pasta - non-vegetarian', 210, 'Pastas', true),
    
    -- Spaghetti Aglio E Olio: Veg ₹185, Non-veg ₹215
    (cook_house_cafe_id, 'Spaghetti Aglio E Olio (Veg)', 'Spaghetti aglio e olio - vegetarian', 185, 'Pastas', true),
    (cook_house_cafe_id, 'Spaghetti Aglio E Olio (Non-veg)', 'Spaghetti aglio e olio - non-vegetarian', 215, 'Pastas', true),
    
    -- Penne Pasta Pesto Sauce: Veg ₹200, Non-veg ₹240
    (cook_house_cafe_id, 'Penne Pasta Pesto Sauce (Veg)', 'Penne pasta pesto sauce - vegetarian', 200, 'Pastas', true),
    (cook_house_cafe_id, 'Penne Pasta Pesto Sauce (Non-veg)', 'Penne pasta pesto sauce - non-vegetarian', 240, 'Pastas', true),
    
    -- Mac & Cheese: Veg ₹210, Non-veg ₹230
    (cook_house_cafe_id, 'Mac & Cheese (Veg)', 'Mac and cheese - vegetarian', 210, 'Pastas', true),
    (cook_house_cafe_id, 'Mac & Cheese (Non-veg)', 'Mac and cheese - non-vegetarian', 230, 'Pastas', true),
    
    -- Spaghetti Pesto Sauce: Veg ₹200, Non-veg ₹240
    (cook_house_cafe_id, 'Spaghetti Pesto Sauce (Veg)', 'Spaghetti pesto sauce - vegetarian', 200, 'Pastas', true),
    (cook_house_cafe_id, 'Spaghetti Pesto Sauce (Non-veg)', 'Spaghetti pesto sauce - non-vegetarian', 240, 'Pastas', true);
    
    RAISE NOTICE 'Added 14 pasta items (7 pastas × 2 variants each)';
    
    -- ========================================
    -- 3. VERIFICATION
    -- ========================================
    
    -- Count pasta items
    DECLARE
        pasta_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO pasta_count 
        FROM public.menu_items 
        WHERE cafe_id = cook_house_cafe_id 
        AND category = 'Pastas';
        
        RAISE NOTICE 'Total pasta items after fix: %', pasta_count;
    END;
    
    RAISE NOTICE 'Pasta variants fix completed successfully!';
    
END $$;

-- Verification query to show the updated pasta items
SELECT 
    'PASTA VARIANTS FIX COMPLETE' as status,
    COUNT(*) as total_pasta_items
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' AND mi.category = 'Pastas';

-- Show all pasta items with their prices, grouped by base name
SELECT 
    CASE 
        WHEN mi.name LIKE '%(Veg)' THEN REPLACE(mi.name, ' (Veg)', '')
        WHEN mi.name LIKE '%(Non-veg)' THEN REPLACE(mi.name, ' (Non-veg)', '')
        ELSE mi.name
    END as base_name,
    mi.name as full_name,
    mi.price,
    mi.is_available
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' AND mi.category = 'Pastas'
ORDER BY 
    CASE 
        WHEN mi.name LIKE '%(Veg)' THEN REPLACE(mi.name, ' (Veg)', '')
        WHEN mi.name LIKE '%(Non-veg)' THEN REPLACE(mi.name, ' (Non-veg)', '')
        ELSE mi.name
    END,
    mi.name;
