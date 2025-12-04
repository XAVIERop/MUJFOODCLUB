-- Update Banna's Chowki Menu
-- 1. Remove "Chowki Special" items
-- 2. Add new beverage items
-- 3. Change category name from 'Murg e Mastani' to 'Chicken Starter'

-- Step 1: Find Banna's Chowki cafe ID
DO $$
DECLARE
    bannas_chowki_cafe_id UUID;
    items_deleted INTEGER := 0;
    items_added INTEGER := 0;
    items_updated INTEGER := 0;
BEGIN
    -- Get Banna's Chowki cafe ID
    SELECT id INTO bannas_chowki_cafe_id 
    FROM public.cafes 
    WHERE slug = 'bannas-chowki' OR LOWER(name) LIKE '%banna%chowki%';
    
    IF bannas_chowki_cafe_id IS NULL THEN
        RAISE EXCEPTION 'Banna''s Chowki cafe not found';
    END IF;
    
    RAISE NOTICE 'Banna''s Chowki Cafe ID: %', bannas_chowki_cafe_id;
    
    -- ========================================
    -- Step 2: Remove "Chowki Special" items
    -- ========================================
    -- This will remove items with "chowki special" in the name (case insensitive)
    -- Examples: "Chowki Special (Half)", "Chowki Special (Full)", etc.
    DELETE FROM public.menu_items
    WHERE cafe_id = bannas_chowki_cafe_id
    AND LOWER(name) LIKE '%chowki special%';
    
    GET DIAGNOSTICS items_deleted = ROW_COUNT;
    RAISE NOTICE 'Deleted % "Chowki Special" items', items_deleted;
    
    -- ========================================
    -- Step 3: Add new beverage items
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available, out_of_stock, is_vegetarian, preparation_time)
    VALUES
    (bannas_chowki_cafe_id, 'Water', 'Bottled water', 20.00, 'Beverages', true, false, true, 2),
    (bannas_chowki_cafe_id, 'Coca Cola 250ml', 'Coca Cola 250ml', 20.00, 'Beverages', true, false, true, 2),
    (bannas_chowki_cafe_id, 'Coca Cola 750ml', 'Coca Cola 750ml', 40.00, 'Beverages', true, false, true, 2),
    (bannas_chowki_cafe_id, 'Red Bull 250ml', 'Red Bull energy drink 250ml', 110.00, 'Beverages', true, false, true, 2)
    ON CONFLICT DO NOTHING; -- Prevent duplicates if items already exist
    
    GET DIAGNOSTICS items_added = ROW_COUNT;
    RAISE NOTICE 'Added % new beverage items', items_added;
    
    -- ========================================
    -- Step 4: Change category name from 'Murg e Mastani' to 'Chicken Starter'
    -- ========================================
    UPDATE public.menu_items
    SET category = 'Chicken Starter',
        updated_at = NOW()
    WHERE cafe_id = bannas_chowki_cafe_id
    AND category = 'Murg e Mastani';
    
    GET DIAGNOSTICS items_updated = ROW_COUNT;
    RAISE NOTICE 'Updated % items from "Murg e Mastani" to "Chicken Starter"', items_updated;
    
    RAISE NOTICE '✅ Menu update completed successfully!';
    RAISE NOTICE '   - Deleted: % items', items_deleted;
    RAISE NOTICE '   - Added: % items', items_added;
    RAISE NOTICE '   - Updated category: % items', items_updated;
    
END $$;

-- ========================================
-- Verification Queries
-- ========================================

-- Check deleted items (should show 0 results)
SELECT 
    'Deleted Items Check' as check_type,
    COUNT(*) as count
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE (c.slug = 'bannas-chowki' OR LOWER(c.name) LIKE '%banna%chowki%')
AND LOWER(mi.name) LIKE '%chowki special%';

-- Check new beverage items
SELECT 
    'New Beverages' as check_type,
    mi.name,
    mi.price,
    mi.category
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE (c.slug = 'bannas-chowki' OR LOWER(c.name) LIKE '%banna%chowki%')
AND mi.name IN ('Water', 'Coca Cola 250ml', 'Coca Cola 750ml', 'Red Bull 250ml')
ORDER BY mi.name;

-- Check category update
SELECT 
    'Category Update Check' as check_type,
    mi.category,
    COUNT(*) as item_count,
    STRING_AGG(mi.name, ', ' ORDER BY mi.name) as items
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE (c.slug = 'bannas-chowki' OR LOWER(c.name) LIKE '%banna%chowki%')
AND mi.category IN ('Murg e Mastani', 'Chicken Starter')
GROUP BY mi.category
ORDER BY mi.category;

-- Show all beverages
SELECT 
    'All Beverages' as check_type,
    mi.name,
    mi.price,
    mi.category
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE (c.slug = 'bannas-chowki' OR LOWER(c.name) LIKE '%banna%chowki%')
AND mi.category = 'Beverages'
ORDER BY mi.price, mi.name;

