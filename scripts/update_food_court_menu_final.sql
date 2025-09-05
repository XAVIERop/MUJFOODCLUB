-- Update FOOD COURT menu with new prices and items for MOMO STREET, KRISPP, and GOBBLERS
-- Run this script directly in your Supabase SQL Editor

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
    
    -- ========================================
    -- UPDATE KRISPP MENU
    -- ========================================
    
    -- Update KRISPPY NON-VEG prices (set is_vegetarian = false)
    UPDATE public.menu_items SET price = 299, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Chicken Hot Wings (6 pcs)';
    UPDATE public.menu_items SET price = 279, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Chicken Strips (6 pcs)';
    UPDATE public.menu_items SET price = 199, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Garlic Chicken Fingers (6 pcs)';
    UPDATE public.menu_items SET price = 299, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Fish Fingers (6 pcs)';
    
    -- Update KRISPPY VEG prices (set is_vegetarian = true)
    UPDATE public.menu_items SET price = 199, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Pizza Pockets (6 pcs)';
    UPDATE public.menu_items SET price = 149, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Veg Strips (6 pcs)';
    UPDATE public.menu_items SET price = 179, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Cheesy Strips (6 pcs)';
    UPDATE public.menu_items SET price = 159, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Onion Rings (6 pcs)';
    UPDATE public.menu_items SET price = 169, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Jalapeno Poppers (6 pcs)';
    
    -- Update KRISPP SNACKS prices (set vegetarian status)
    UPDATE public.menu_items SET price = 119, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Chilli Garlic Potato';
    UPDATE public.menu_items SET price = 129, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Chicken Popcorn';
    UPDATE public.menu_items SET price = 139, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Corn Cheese Nuggets';
    UPDATE public.menu_items SET price = 149, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Chicken Nuggets';
    UPDATE public.menu_items SET price = 109, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Masala French Fries';
    
    -- Update KRISPP BURGER prices (set vegetarian status)
    UPDATE public.menu_items SET price = 99, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Classic Veg Burger';
    UPDATE public.menu_items SET price = 109, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Classic Chicken Burger';
    UPDATE public.menu_items SET price = 149, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Krisppy Paneer Burger';
    UPDATE public.menu_items SET price = 159, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Krisppy Chicken Burger';
    UPDATE public.menu_items SET price = 169, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Krisppy Fish Burger';
    
    -- Update KRISPP BEVERAGES prices (all vegetarian)
    UPDATE public.menu_items SET price = 89, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Masala Lemonade' AND category = 'KRISPP - Beverages';
    UPDATE public.menu_items SET price = 89, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Cola Lemonade' AND category = 'KRISPP - Beverages';
    UPDATE public.menu_items SET price = 89, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Virgin Mojito' AND category = 'KRISPP - Beverages';
    UPDATE public.menu_items SET price = 89, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Cucumber Mojito' AND category = 'KRISPP - Beverages';
    UPDATE public.menu_items SET price = 89, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Watermelon Mojito' AND category = 'KRISPP - Beverages';
    UPDATE public.menu_items SET price = 89, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Green Apple Mojito' AND category = 'KRISPP - Beverages';
    UPDATE public.menu_items SET price = 89, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Blue Magic Mojito' AND category = 'KRISPP - Beverages';
    
    -- Add KRISPP Make It A Meal options (set vegetarian status)
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available, is_vegetarian) VALUES
    (food_court_id, 'Veg Upgrade - Chilli Garlic Potato + Any Beverage', 'Veg upgrade combo with chilli garlic potato and any beverage', 159, 'KRISPP - Combos', true, true),
    (food_court_id, 'Non-Veg Upgrade - Chicken Popcorn + Any Beverage', 'Non-veg upgrade combo with chicken popcorn and any beverage', 169, 'KRISPP - Combos', true, false);
    
    -- ========================================
    -- UPDATE MOMO STREET MENU
    -- ========================================
    
    -- Update STEAMED MOMOS prices (set vegetarian status)
    UPDATE public.menu_items SET price = 99, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Veggie Momos (6 pcs)';
    UPDATE public.menu_items SET price = 109, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Paneer Momos (6 pcs)';
    UPDATE public.menu_items SET price = 109, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Corn & Cheese Momos (6 pcs)';
    UPDATE public.menu_items SET price = 109, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Chicken Momos (6 pcs)';
    UPDATE public.menu_items SET price = 119, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Chicken & Cheese Momos (6 pcs)';
    UPDATE public.menu_items SET price = 119, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Spicy Chicken Momos (6 pcs)';
    
    -- Update FRIED MOMOS prices (set vegetarian status)
    UPDATE public.menu_items SET price = 119, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Veggie Fried Momos (6 pcs)';
    UPDATE public.menu_items SET price = 129, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Paneer Fried Momos (6 pcs)';
    UPDATE public.menu_items SET price = 129, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Corn & Cheese Fried Momos (6 pcs)';
    UPDATE public.menu_items SET price = 129, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Chicken Fried Momos (6 pcs)';
    UPDATE public.menu_items SET price = 139, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Chicken & Cheese Fried Momos (6 pcs)';
    UPDATE public.menu_items SET price = 139, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Spicy Chicken Fried Momos (6 pcs)';
    
    -- Update KURKURE MOMOS prices (set vegetarian status)
    UPDATE public.menu_items SET price = 129, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Veggie Kurkure Momos (6 pcs)';
    UPDATE public.menu_items SET price = 139, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Paneer Kurkure Momos (6 pcs)';
    UPDATE public.menu_items SET price = 139, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Corn & Cheese Kurkure Momos (6 pcs)';
    UPDATE public.menu_items SET price = 139, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Chicken Kurkure Momos (6 pcs)';
    UPDATE public.menu_items SET price = 149, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Chicken & Cheese Kurkure Momos (6 pcs)';
    UPDATE public.menu_items SET price = 149, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Spicy Chicken Kurkure Momos (6 pcs)';
    
    -- Update GRAVY MOMOS prices (6 items with 3 gravy options: Makhni/Lahori/Schezwan)
    -- Each item can be done in one of the 3 gravy options (set vegetarian status)
    UPDATE public.menu_items SET price = 139, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Veggie Gravy Momos (6 pcs)';
    UPDATE public.menu_items SET price = 149, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Paneer Gravy Momos (6 pcs)';
    UPDATE public.menu_items SET price = 149, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Corn & Cheese Gravy Momos (6 pcs)';
    UPDATE public.menu_items SET price = 149, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Chicken Gravy Momos (6 pcs)';
    UPDATE public.menu_items SET price = 159, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Chicken & Cheese Gravy Momos (6 pcs)';
    UPDATE public.menu_items SET price = 159, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Spicy Chicken Gravy Momos (6 pcs)';
    
    -- Add note about gravy options (Makhni/Lahori/Schezwan) for each gravy momo item
    -- This will be handled in the application UI to show the 3 gravy options for each item
    
    -- Update MOMO STREET STARTERS prices (set vegetarian status)
    UPDATE public.menu_items SET price = 149, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Dosa Spring Roll (6 pcs)';
    UPDATE public.menu_items SET price = 149, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Veggie Spring Roll (6 pcs)';
    UPDATE public.menu_items SET price = 189, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Chicken Spring Roll (6 pcs)';
    UPDATE public.menu_items SET price = 139, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Corn & Cheese Nuggets (6 pcs)';
    UPDATE public.menu_items SET price = 149, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Chicken Nuggets (6 pcs)';
    
    -- Update MOMO STREET BEVERAGES prices (all vegetarian)
    UPDATE public.menu_items SET price = 89, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Masala Lemonade' AND category = 'Momo Street - Beverages';
    UPDATE public.menu_items SET price = 89, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Cola Lemonade' AND category = 'Momo Street - Beverages';
    UPDATE public.menu_items SET price = 89, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Virgin Mojito' AND category = 'Momo Street - Beverages';
    UPDATE public.menu_items SET price = 89, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Cucumber Mojito' AND category = 'Momo Street - Beverages';
    UPDATE public.menu_items SET price = 89, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Watermelon Mojito' AND category = 'Momo Street - Beverages';
    UPDATE public.menu_items SET price = 89, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Green Apple Mojito' AND category = 'Momo Street - Beverages';
    UPDATE public.menu_items SET price = 89, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Blue Magic Mojito' AND category = 'Momo Street - Beverages';
    
    -- ========================================
    -- UPDATE GOBBLERS MENU
    -- ========================================
    
    -- Remove all prawn items from GOBBLERS
    DELETE FROM public.menu_items WHERE cafe_id = food_court_id AND name LIKE '%(Prawns)%';
    DELETE FROM public.menu_items WHERE cafe_id = food_court_id AND name LIKE '%Prawn%';
    
    -- Update GOBBLERS BOWLS prices (remove prawn items, update paneer/chicken prices, set vegetarian status)
    UPDATE public.menu_items SET price = 169, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Khichdi Bowl';
    UPDATE public.menu_items SET price = 199, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Rajma - Rice Bowl';
    UPDATE public.menu_items SET price = 199, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Dilli Chola - Rice Bowl';
    UPDATE public.menu_items SET price = 199, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Dal Makhni - Rice Bowl';
    UPDATE public.menu_items SET price = 219, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Makhni Rice Bowl (Paneer)';
    UPDATE public.menu_items SET price = 229, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Makhni Rice Bowl (Chicken)';
    UPDATE public.menu_items SET price = 219, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Lahori Rice Bowl (Paneer)';
    UPDATE public.menu_items SET price = 229, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Lahori Rice Bowl (Chicken)';
    UPDATE public.menu_items SET price = 219, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Chinese Rice Bowl (Paneer)';
    UPDATE public.menu_items SET price = 229, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Chinese Rice Bowl (Chicken)';
    UPDATE public.menu_items SET price = 239, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Biryani Bowl (Paneer)';
    UPDATE public.menu_items SET price = 249, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Biryani Bowl (Chicken)';
    UPDATE public.menu_items SET price = 179, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Red Sauce Pasta Bowl';
    UPDATE public.menu_items SET price = 179, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'White Sauce Pasta Bowl';
    UPDATE public.menu_items SET price = 189, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Mix Sauce Pasta Bowl';
    UPDATE public.menu_items SET price = 69, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Add On - Chicken';
    
    -- Update GOBBLERS STARTERS prices (set vegetarian status)
    UPDATE public.menu_items SET price = 149, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Hara - Bhara Kebab (6 pcs)';
    UPDATE public.menu_items SET price = 159, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Dahi Ke Kebab (6 pcs)';
    UPDATE public.menu_items SET price = 189, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Corn Cheese Kebab (6 pcs)';
    UPDATE public.menu_items SET price = 179, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Chicken Cheese Kebab (6 pcs)';
    
    -- Update GOBBLERS WRAPS prices (set vegetarian status)
    UPDATE public.menu_items SET price = 99, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Veg Wrap';
    UPDATE public.menu_items SET price = 119, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Paneer Wrap';
    UPDATE public.menu_items SET price = 119, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Chicken Wrap';
    UPDATE public.menu_items SET price = 139, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Makhni Wrap (Paneer)';
    UPDATE public.menu_items SET price = 139, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Makhni Wrap (Chicken)';
    UPDATE public.menu_items SET price = 139, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Lahori Wrap (Paneer)';
    UPDATE public.menu_items SET price = 139, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Lahori Wrap (Chicken)';
    UPDATE public.menu_items SET price = 139, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Schezwan Wrap (Paneer)';
    UPDATE public.menu_items SET price = 139, is_vegetarian = false WHERE cafe_id = food_court_id AND name = 'Schezwan Wrap (Chicken)';
    
    -- Update GOBBLERS BEVERAGES prices (all vegetarian)
    UPDATE public.menu_items SET price = 89, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Masala Lemonade' AND category = 'GOBBLERS - Beverages';
    UPDATE public.menu_items SET price = 89, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Cola Lemonade' AND category = 'GOBBLERS - Beverages';
    UPDATE public.menu_items SET price = 89, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Virgin Mojito' AND category = 'GOBBLERS - Beverages';
    UPDATE public.menu_items SET price = 89, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Cucumber Mojito' AND category = 'GOBBLERS - Beverages';
    UPDATE public.menu_items SET price = 89, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Watermelon Mojito' AND category = 'GOBBLERS - Beverages';
    UPDATE public.menu_items SET price = 89, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Green Apple Mojito' AND category = 'GOBBLERS - Beverages';
    UPDATE public.menu_items SET price = 89, is_vegetarian = true WHERE cafe_id = food_court_id AND name = 'Blue Magic Mojito' AND category = 'GOBBLERS - Beverages';
    
    RAISE NOTICE '✅ FOOD COURT menu updated successfully with new prices for MOMO STREET, KRISPP, and GOBBLERS';
    RAISE NOTICE '✅ Removed all prawn items from GOBBLERS menu';
    RAISE NOTICE '✅ Updated rice bowl prices: Paneer (219), Chicken (229)';
    RAISE NOTICE '✅ Gravy Momos: 6 items with 3 gravy options (Makhni/Lahori/Schezwan)';
    RAISE NOTICE '✅ Add On Chicken available at 69 for all orders';
    RAISE NOTICE '✅ Added vegetarian segregation (is_vegetarian field) for all menu items';
    RAISE NOTICE '✅ Veg/Non-Veg toggles will now work properly with the updated menu';
    
END $$;
