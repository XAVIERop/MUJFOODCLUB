-- Check and update is_vegetarian column for Food Court menu
-- This script checks if the column exists and updates menu items accordingly

DO $$
DECLARE
    food_court_id UUID;
    column_exists BOOLEAN;
BEGIN
    -- Get the cafe ID
    SELECT id INTO food_court_id FROM public.cafes WHERE name = 'FOOD COURT';
    
    IF food_court_id IS NULL THEN
        RAISE EXCEPTION 'FOOD COURT cafe not found';
    END IF;
    
    RAISE NOTICE 'Found FOOD COURT cafe with ID: %', food_court_id;
    
    -- Check if is_vegetarian column exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'menu_items' 
        AND column_name = 'is_vegetarian'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        RAISE NOTICE 'Adding is_vegetarian column...';
        ALTER TABLE public.menu_items 
        ADD COLUMN is_vegetarian BOOLEAN DEFAULT true;
        RAISE NOTICE '✅ Added is_vegetarian column';
    ELSE
        RAISE NOTICE '✅ is_vegetarian column already exists';
    END IF;
    
    -- Check current state of menu items
    RAISE NOTICE 'Current menu items status:';
    RAISE NOTICE 'Total items: %', (SELECT COUNT(*) FROM public.menu_items WHERE cafe_id = food_court_id);
    RAISE NOTICE 'Vegetarian items: %', (SELECT COUNT(*) FROM public.menu_items WHERE cafe_id = food_court_id AND is_vegetarian = true);
    RAISE NOTICE 'Non-vegetarian items: %', (SELECT COUNT(*) FROM public.menu_items WHERE cafe_id = food_court_id AND is_vegetarian = false);
    RAISE NOTICE 'Null items: %', (SELECT COUNT(*) FROM public.menu_items WHERE cafe_id = food_court_id AND is_vegetarian IS NULL);
    
    -- Show sample items
    RAISE NOTICE 'Sample vegetarian items:';
    FOR rec IN 
        SELECT name, category, price 
        FROM public.menu_items 
        WHERE cafe_id = food_court_id AND is_vegetarian = true 
        LIMIT 3
    LOOP
        RAISE NOTICE '  - % (%) - ₹%', rec.name, rec.category, rec.price;
    END LOOP;
    
    RAISE NOTICE 'Sample non-vegetarian items:';
    FOR rec IN 
        SELECT name, category, price 
        FROM public.menu_items 
        WHERE cafe_id = food_court_id AND is_vegetarian = false 
        LIMIT 3
    LOOP
        RAISE NOTICE '  - % (%) - ₹%', rec.name, rec.category, rec.price;
    END LOOP;
    
    RAISE NOTICE '✅ Check completed successfully!';
    
END $$;
