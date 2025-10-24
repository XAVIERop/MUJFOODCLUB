-- Check for duplicate Food Court menu items, especially mojitos
-- This will help identify the issue with 3 identical "Full" options

-- Get Food Court cafe ID
DO $$
DECLARE
    food_court_id UUID;
BEGIN
    -- Get the cafe ID
    SELECT id INTO food_court_id FROM public.cafes WHERE name = 'FOOD COURT';
    
    IF food_court_id IS NULL THEN
        RAISE EXCEPTION 'FOOD COURT cafe not found';
    END IF;
    
    RAISE NOTICE 'Found FOOD COURT cafe with ID: %', food_court_id;
    
    -- Check for duplicate mojito items
    RAISE NOTICE '=== CHECKING FOR DUPLICATE MOJITO ITEMS ===';
    
    SELECT 
        name,
        COUNT(*) as duplicate_count,
        STRING_AGG(id::text, ', ') as duplicate_ids,
        STRING_AGG(price::text, ', ') as prices
    FROM public.menu_items 
    WHERE cafe_id = food_court_id 
    AND (name ILIKE '%mojito%' OR category ILIKE '%beverage%')
    GROUP BY name
    HAVING COUNT(*) > 1
    ORDER BY duplicate_count DESC;
    
    -- Check all mojito items
    RAISE NOTICE '=== ALL MOJITO ITEMS ===';
    
    SELECT 
        id,
        name,
        description,
        price,
        category,
        is_available
    FROM public.menu_items 
    WHERE cafe_id = food_court_id 
    AND (name ILIKE '%mojito%' OR category ILIKE '%beverage%')
    ORDER BY name, price;
    
    -- Check total menu items for Food Court
    RAISE NOTICE '=== TOTAL FOOD COURT MENU ITEMS ===';
    
    SELECT 
        COUNT(*) as total_items,
        COUNT(DISTINCT name) as unique_names
    FROM public.menu_items 
    WHERE cafe_id = food_court_id;
    
END $$;
