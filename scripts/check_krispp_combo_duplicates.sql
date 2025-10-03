-- Check for duplicate KRISPP combo items in Food Court
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
    
    -- Check for duplicate combo items
    RAISE NOTICE '=== CHECKING FOR DUPLICATE KRISPP COMBO ITEMS ===';
    
    SELECT 
        name,
        COUNT(*) as duplicate_count,
        STRING_AGG(id::text, ', ') as duplicate_ids,
        STRING_AGG(price::text, ', ') as prices,
        STRING_AGG(category, ', ') as categories
    FROM public.menu_items 
    WHERE cafe_id = food_court_id 
    AND (name ILIKE '%combo%' OR name ILIKE '%upgrade%')
    GROUP BY name
    HAVING COUNT(*) > 1
    ORDER BY duplicate_count DESC;
    
    -- Check all combo items
    RAISE NOTICE '=== ALL KRISPP COMBO ITEMS ===';
    
    SELECT 
        id,
        name,
        description,
        price,
        category,
        is_available
    FROM public.menu_items 
    WHERE cafe_id = food_court_id 
    AND (name ILIKE '%combo%' OR name ILIKE '%upgrade%')
    ORDER BY name, price;
    
    -- Check total menu items for Food Court
    RAISE NOTICE '=== TOTAL FOOD COURT MENU ITEMS ===';
    
    SELECT 
        COUNT(*) as total_items,
        COUNT(DISTINCT name) as unique_names
    FROM public.menu_items 
    WHERE cafe_id = food_court_id;
    
END $$;
