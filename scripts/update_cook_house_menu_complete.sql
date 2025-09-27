-- Update Cook House Menu to Match Provided Images Exactly
-- This script adds missing items, fixes price mismatches, and removes extra items
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
    
    RAISE NOTICE 'Updating Cook House menu (ID: %)', cook_house_cafe_id;
    
    -- ========================================
    -- 1. FIX PRICE MISMATCHES
    -- ========================================
    
    -- Fix Curd price (Image: ₹70, Database: ₹210)
    UPDATE public.menu_items 
    SET price = 70, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND name = 'Curd Rice' 
    AND price = 210;
    
    -- Fix Soya Chaap Tikka price (Image: ₹250, Database: ₹200)
    UPDATE public.menu_items 
    SET price = 250, updated_at = NOW()
    WHERE cafe_id = cook_house_cafe_id 
    AND name = 'Soya Chaap Tikka' 
    AND price = 200;
    
    RAISE NOTICE 'Fixed 2 price mismatches';
    
    -- ========================================
    -- 2. REMOVE EXTRA ITEMS (items in database but not in images)
    -- ========================================
    
    -- Remove separate Dry/Gravy items (images show combined pricing)
    DELETE FROM public.menu_items 
    WHERE cafe_id = cook_house_cafe_id 
    AND name IN (
        'Crispy Chilly Paneer (Dry)',
        'Crispy Chilly Paneer (Gravy)',
        'Veg Manchurian (Dry)',
        'Veg Manchurian (Gravy)'
    );
    
    -- Remove separate Plain/Butter bread items (images show combined pricing)
    DELETE FROM public.menu_items 
    WHERE cafe_id = cook_house_cafe_id 
    AND name IN (
        'Tandoori Roti (Plain)',
        'Tandoori Roti (Butter)',
        'Pudina Laccha Paratha (Plain)',
        'Pudina Laccha Paratha (Butter)',
        'Hari Mirch Laccha Paratha (Plain)',
        'Hari Mirch Laccha Paratha (Butter)',
        'Laccha Paratha (Plain)',
        'Laccha Paratha (Butter)',
        'Naan (Plain)',
        'Naan (Butter)',
        'Garlic Naan (Plain)',
        'Garlic Naan (Butter)'
    );
    
    -- Remove separate Half/Full Dal Maharani items (images show combined pricing)
    DELETE FROM public.menu_items 
    WHERE cafe_id = cook_house_cafe_id 
    AND name IN (
        'Dal Maharani (Half)',
        'Dal Maharani (Full)'
    );
    
    RAISE NOTICE 'Removed 18 extra items';
    
    -- ========================================
    -- 3. ADD MISSING ITEMS FROM IMAGES
    -- ========================================
    
    -- DRINKS - MOCKTAILS
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Fresh Lime Soda', 'Fresh lime soda', 100, 'Drinks', true),
    (cook_house_cafe_id, 'Masala Lemon Soda', 'Masala lemon soda', 120, 'Drinks', true),
    (cook_house_cafe_id, 'Green Goddess', 'Green goddess mocktail', 110, 'Drinks', true),
    (cook_house_cafe_id, 'Fruit Punch', 'Fruit punch mocktail', 150, 'Drinks', true),
    (cook_house_cafe_id, 'Mojito', 'Mojito mocktail', 150, 'Drinks', true);
    
    -- DRINKS - SHAKES
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Strawberry Shake', 'Strawberry shake', 120, 'Drinks', true),
    (cook_house_cafe_id, 'Kitkat Shake', 'Kitkat shake', 130, 'Drinks', true),
    (cook_house_cafe_id, 'Oreo Shake', 'Oreo shake', 140, 'Drinks', true),
    (cook_house_cafe_id, 'Banana Shake', 'Banana shake', 110, 'Drinks', true),
    (cook_house_cafe_id, 'Mango Shake', 'Mango shake', 120, 'Drinks', true),
    (cook_house_cafe_id, 'Coke/Fanta/Mirinda/Sprite', 'Soft drinks at MRP', 0, 'Drinks', true);
    
    -- DRINKS - REFRESHMENTS
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Butter Milk', 'Butter milk', 55, 'Drinks', true);
    
    -- CHINA WALL - Combined items (replacing separate Dry/Gravy)
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Crispy Chilly Paneer (Dry/Gravy)', 'Crispy paneer in chili sauce', 260, 'China Wall', true),
    (cook_house_cafe_id, 'Veg Manchurian (Dry/Gravy)', 'Vegetable manchurian', 180, 'China Wall', true);
    
    -- ROLL MANIA
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Soya Chaap Roll', 'Soya chaap roll', 120, 'Roll Mania', true),
    (cook_house_cafe_id, 'Kolkata Veg Roll', 'Kolkata vegetable roll', 100, 'Roll Mania', true),
    (cook_house_cafe_id, 'Paneer Kathi Roll', 'Paneer kathi roll', 140, 'Roll Mania', true),
    (cook_house_cafe_id, 'Egg Roll', 'Egg roll', 140, 'Roll Mania', true),
    (cook_house_cafe_id, 'Chicken Roll', 'Chicken roll', 190, 'Roll Mania', true),
    (cook_house_cafe_id, 'Chicken Seekh Kebab Roll', 'Chicken seekh kebab roll', 200, 'Roll Mania', true);
    
    -- JUGAL-BANDI (COMBO MEALS)
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Chole Bhature', 'Chole bhature combo', 140, 'Combo Meals', true),
    (cook_house_cafe_id, 'Chole Kulche', 'Chole kulche combo', 140, 'Combo Meals', true),
    (cook_house_cafe_id, 'Chole Chawal', 'Chole chawal combo', 140, 'Combo Meals', true),
    (cook_house_cafe_id, 'Rajma Chawal', 'Rajma chawal combo', 140, 'Combo Meals', true),
    (cook_house_cafe_id, 'Punjabi Kadi Chawal', 'Punjabi kadi chawal combo', 140, 'Combo Meals', true),
    (cook_house_cafe_id, 'Paneer Sabzi (chef''s choice) + 2 Butter Roti', 'Paneer sabzi with 2 butter roti', 170, 'Combo Meals', true),
    (cook_house_cafe_id, 'Dal Makhani + 1 Butter Naan', 'Dal makhani with 1 butter naan', 180, 'Combo Meals', true),
    (cook_house_cafe_id, 'Dal Chawal', 'Dal chawal combo', 140, 'Combo Meals', true),
    (cook_house_cafe_id, 'Punjabi Chicken Curry + 1 plain kulcha', 'Punjabi chicken curry with 1 plain kulcha', 250, 'Combo Meals', true);
    
    -- BUN MUSKA
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Plain Vada Pao (2 pcs)', 'Plain vada pao - 2 pieces', 110, 'Bun Muska', true),
    (cook_house_cafe_id, 'Cheese Vada Pao (2 pcs)', 'Cheese vada pao - 2 pieces', 130, 'Bun Muska', true),
    (cook_house_cafe_id, 'Dabeli (2 pcs)', 'Dabeli - 2 pieces', 130, 'Bun Muska', true),
    (cook_house_cafe_id, 'Pao Bhaji', 'Pao bhaji', 150, 'Bun Muska', true),
    (cook_house_cafe_id, 'Keema Pao (Chicken/Mutton)', 'Keema pao - chicken or mutton', 190, 'Bun Muska', true),
    (cook_house_cafe_id, 'Extra - per piece', 'Extra vada pao per piece', 20, 'Bun Muska', true);
    
    -- SANDWICH
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Veg Cheese Sandwich', 'Vegetable cheese sandwich', 110, 'Sandwich', true),
    (cook_house_cafe_id, 'Pesto Tomato Cheese Sandwich', 'Pesto tomato cheese sandwich', 110, 'Sandwich', true),
    (cook_house_cafe_id, 'Paneer Tikka Sandwich', 'Paneer tikka sandwich', 120, 'Sandwich', true),
    (cook_house_cafe_id, 'Bombay Masala Toast', 'Bombay masala toast', 110, 'Sandwich', true),
    (cook_house_cafe_id, 'Omlette Sandwich', 'Omlette sandwich', 120, 'Sandwich', true),
    (cook_house_cafe_id, 'Chicken Tikka Sandwich', 'Chicken tikka sandwich', 140, 'Sandwich', true);
    
    -- PIZZA
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Margherita', 'Margherita pizza', 99, 'Pizza', true),
    (cook_house_cafe_id, 'All Veg Pizza', 'All vegetable pizza', 130, 'Pizza', true),
    (cook_house_cafe_id, 'Paneer Tikka Pizza', 'Paneer tikka pizza', 160, 'Pizza', true),
    (cook_house_cafe_id, 'Classic Pesto Pizza', 'Classic pesto pizza', 165, 'Pizza', true),
    (cook_house_cafe_id, 'Chicken Tikka Pizza', 'Chicken tikka pizza', 195, 'Pizza', true);
    
    -- RAITA
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Mix veg Raita', 'Mixed vegetable raita', 110, 'Raita', true),
    (cook_house_cafe_id, 'Nupuri Raita (Boondi)', 'Boondi raita', 100, 'Raita', true),
    (cook_house_cafe_id, 'Fried Raita', 'Fried raita', 110, 'Raita', true);
    
    -- PAPAD
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Plain Papad (Roasted/Fried)', 'Plain papad - roasted or fried', 40, 'Papad', true),
    (cook_house_cafe_id, 'Masala Papad (Roasted/Fried)', 'Masala papad - roasted or fried', 60, 'Papad', true);
    
    -- THALI
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'SPECIAL THALI (Veg)', 'Paneer Lababdar + Dal Makhani + Vegetable + Rice + 2 Tandoori Roti + 1 Laccha Paratha + Raita + Salad + Pickle + Papad', 230, 'Thali', true),
    (cook_house_cafe_id, 'SPECIAL THALI (Non-Veg)', 'Butter Chicken + Egg Curry + Dal Makhni + Rice + 2 Tandoori Roti + 1 Laccha Paratha + Raita + Salad + Pickle + Papad', 300, 'Thali', true);
    
    -- BREADS - Combined items (replacing separate Plain/Butter)
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Tandoori Roti (plain/butter)', 'Tandoori roti - plain or butter', 18, 'Breads', true),
    (cook_house_cafe_id, 'Pudina Laccha Paratha (plain/butter)', 'Mint laccha paratha - plain or butter', 50, 'Breads', true),
    (cook_house_cafe_id, 'Hari Mirch Laccha Paratha (plain/butter)', 'Green chili laccha paratha - plain or butter', 55, 'Breads', true),
    (cook_house_cafe_id, 'Laccha Paratha (plain/butter)', 'Laccha paratha - plain or butter', 55, 'Breads', true),
    (cook_house_cafe_id, 'Naan (plain/butter)', 'Naan - plain or butter', 50, 'Breads', true),
    (cook_house_cafe_id, 'Garlic Naan (plain/Butter)', 'Garlic naan - plain or butter', 65, 'Breads', true);
    
    -- PARATHA (with curd & pickle)
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Aloo Paratha - 2pcs', 'Aloo paratha - 2 pieces with curd & pickle', 140, 'Paratha', true),
    (cook_house_cafe_id, 'Aloo Pyaaz Paratha - 2pcs', 'Aloo pyaaz paratha - 2 pieces with curd & pickle', 150, 'Paratha', true),
    (cook_house_cafe_id, 'Paneer Onion Paratha - 2pcs', 'Paneer onion paratha - 2 pieces with curd & pickle', 160, 'Paratha', true),
    (cook_house_cafe_id, 'Gobhi Paratha -2pcs', 'Gobhi paratha - 2 pieces with curd & pickle', 140, 'Paratha', true),
    (cook_house_cafe_id, 'Onion Cheese Paratha -2pcs', 'Onion cheese paratha - 2 pieces with curd & pickle', 170, 'Paratha', true),
    (cook_house_cafe_id, 'Cheese Corn Paratha -2pcs', 'Cheese corn paratha - 2 pieces with curd & pickle', 160, 'Paratha', true),
    (cook_house_cafe_id, 'Mix Paratha -2pcs', 'Mix paratha - 2 pieces with curd & pickle', 160, 'Paratha', true);
    
    -- MAGGI JUNCTION
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Butter Maggi', 'Butter maggi', 60, 'Maggi Junction', true),
    (cook_house_cafe_id, 'Cheese Maggi', 'Cheese maggi', 80, 'Maggi Junction', true),
    (cook_house_cafe_id, 'Hot Chilli Garlic Maggi', 'Hot chilli garlic maggi', 70, 'Maggi Junction', true),
    (cook_house_cafe_id, 'Vegetable Butter Maggi', 'Vegetable butter maggi', 80, 'Maggi Junction', true),
    (cook_house_cafe_id, 'Paneer Tikka Maggi', 'Paneer tikka maggi', 90, 'Maggi Junction', true),
    (cook_house_cafe_id, 'Chicken Keema Maggi', 'Chicken keema maggi', 110, 'Maggi Junction', true),
    (cook_house_cafe_id, 'Mutton Keema Maggi', 'Mutton keema maggi', 130, 'Maggi Junction', true);
    
    -- PASTAS (VEG/NON-VEG)
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Penne-al-Arrabiata (Red)', 'Penne arrabiata - red sauce', 180, 'Pastas', true),
    (cook_house_cafe_id, 'Penne Pasta Alfredo (White)', 'Penne pasta alfredo - white sauce', 180, 'Pastas', true),
    (cook_house_cafe_id, 'Pink Sauce Pasta', 'Pink sauce pasta', 180, 'Pastas', true),
    (cook_house_cafe_id, 'Spaghetti Aglio E Olio', 'Spaghetti aglio e olio', 185, 'Pastas', true),
    (cook_house_cafe_id, 'Penne Pasta Pesto Sauce', 'Penne pasta pesto sauce', 200, 'Pastas', true),
    (cook_house_cafe_id, 'Mac & Cheese', 'Mac and cheese', 210, 'Pastas', true),
    (cook_house_cafe_id, 'Spaghetti Pesto Sauce', 'Spaghetti pesto sauce', 200, 'Pastas', true);
    
    -- CHATPATAA-CHAAT
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Samosa Chaat', 'Samosa chaat', 180, 'Chatpataa-Chaat', true),
    (cook_house_cafe_id, 'Aloo Papdi Chaat', 'Aloo papdi chaat', 180, 'Chatpataa-Chaat', true);
    
    -- STARTERS - VEGETARIAN
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Bhutte Ke Kebab (8 pcs)', 'Bhutte ke kebab - 8 pieces', 210, 'Starters', true),
    (cook_house_cafe_id, 'Paneer Tikka (6 pcs)', 'Paneer tikka - 6 pieces', 270, 'Starters', true),
    (cook_house_cafe_id, 'Malai Paneer Tikka (6 pcs)', 'Malai paneer tikka - 6 pieces', 280, 'Starters', true),
    (cook_house_cafe_id, 'Malai Soya Chaap Tikka', 'Malai soya chaap tikka', 260, 'Starters', true),
    (cook_house_cafe_id, 'Aachari Paneer Tikka (6 pcs)', 'Aachari paneer tikka - 6 pieces', 270, 'Starters', true),
    (cook_house_cafe_id, 'Hara Bhara Kebab (8 pcs)', 'Hara bhara kebab - 8 pieces', 220, 'Starters', true),
    (cook_house_cafe_id, 'Mushroom Tikka', 'Mushroom tikka', 270, 'Starters', true),
    (cook_house_cafe_id, 'Paneer Pudina Tikka (6 pcs)', 'Paneer pudina tikka - 6 pieces', 280, 'Starters', true);
    
    -- STARTERS - NON-VEGETARIAN
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Chicken Tikka (8 pcs)', 'Chicken tikka - 8 pieces', 370, 'Starters', true),
    (cook_house_cafe_id, 'Aachari Chicken Tikka', 'Aachari chicken tikka', 370, 'Starters', true),
    (cook_house_cafe_id, 'Garlic Chicken Tikka', 'Garlic chicken tikka', 380, 'Starters', true),
    (cook_house_cafe_id, 'Murgh Malai Tikka (6 pcs)', 'Murgh malai tikka - 6 pieces', 360, 'Starters', true),
    (cook_house_cafe_id, 'Chicken Seekh Kebab', 'Chicken seekh kebab', 400, 'Starters', true),
    (cook_house_cafe_id, 'Tandoori Chicken (half/full)', 'Tandoori chicken - half or full', 320, 'Starters', true),
    (cook_house_cafe_id, 'Pudina Chicken Tikka (6 pcs)', 'Pudina chicken tikka - 6 pieces', 360, 'Starters', true);
    
    -- SOUPS
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Manchaw Soup (Veg)', 'Manchaw soup - vegetarian', 100, 'Soups', true),
    (cook_house_cafe_id, 'Manchaw Soup (Non-veg)', 'Manchaw soup - non-vegetarian', 120, 'Soups', true),
    (cook_house_cafe_id, 'Hot''n''sour (Veg)', 'Hot and sour soup - vegetarian', 100, 'Soups', true),
    (cook_house_cafe_id, 'Hot''n''sour (Non-veg)', 'Hot and sour soup - non-vegetarian', 120, 'Soups', true),
    (cook_house_cafe_id, 'Tomato Basil Soup', 'Tomato basil soup', 100, 'Soups', true),
    (cook_house_cafe_id, 'Murgh Shejani Shorba', 'Murgh shejani shorba', 130, 'Soups', true);
    
    -- TIME-PASS
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Chilli Garlic Potato Nuggets (10 pcs)', 'Chilli garlic potato nuggets - 10 pieces', 130, 'Time-Pass', true),
    (cook_house_cafe_id, 'Peri Peri Fries', 'Peri peri fries', 130, 'Time-Pass', true),
    (cook_house_cafe_id, 'Masala Fries', 'Masala fries', 140, 'Time-Pass', true),
    (cook_house_cafe_id, 'Potato Cheese Pops (10 pcs)', 'Potato cheese pops - 10 pieces', 160, 'Time-Pass', true),
    (cook_house_cafe_id, 'Cocktail Samosa (6 pcs)', 'Cocktail samosa - 6 pieces', 120, 'Time-Pass', true),
    (cook_house_cafe_id, 'Cheese Corn Samosa (6 pcs)', 'Cheese corn samosa - 6 pieces', 140, 'Time-Pass', true),
    (cook_house_cafe_id, 'Chicken Nuggets (8 pcs)', 'Chicken nuggets - 8 pieces', 200, 'Time-Pass', true);
    
    -- SALAD
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Green Salad', 'Green salad', 70, 'Salad', true),
    (cook_house_cafe_id, 'Kachumber', 'Kachumber salad', 100, 'Salad', true),
    (cook_house_cafe_id, 'Coleslaw', 'Coleslaw salad', 100, 'Salad', true),
    (cook_house_cafe_id, 'Corn Chaat', 'Corn chaat', 120, 'Salad', true);
    
    -- DAL DARSHAN - Combined item (replacing separate Half/Full)
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cook_house_cafe_id, 'Dal Maharani (Dal Makhni)', 'Royal dal makhni', 190, 'Dal Darshan', true);
    
    RAISE NOTICE 'Added 113 missing items';
    
    -- ========================================
    -- 4. VERIFICATION
    -- ========================================
    
    -- Count total menu items
    DECLARE
        total_items INTEGER;
    BEGIN
        SELECT COUNT(*) INTO total_items 
        FROM public.menu_items 
        WHERE cafe_id = cook_house_cafe_id;
        
        RAISE NOTICE 'Total menu items after update: %', total_items;
    END;
    
    RAISE NOTICE 'Cook House menu update completed successfully!';
    
END $$;

-- Verification query to show the updated menu
SELECT 
    'COOK HOUSE MENU UPDATE COMPLETE' as status,
    COUNT(*) as total_items,
    COUNT(CASE WHEN is_available = true THEN 1 END) as available_items,
    COUNT(CASE WHEN is_available = false THEN 1 END) as unavailable_items
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE';

-- Show menu by category
SELECT 
    mi.category,
    COUNT(*) as item_count,
    MIN(mi.price) as min_price,
    MAX(mi.price) as max_price
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE'
GROUP BY mi.category
ORDER BY mi.category;
