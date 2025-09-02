-- Add THE GARRISON CO. cafe with comprehensive menu from the provided images
-- Run this script directly in your Supabase SQL Editor

DO $$
DECLARE
    garrison_co_cafe_id UUID;
BEGIN
    -- Check if The Garrison Co. cafe exists, if not create it
    SELECT id INTO garrison_co_cafe_id FROM public.cafes WHERE name = 'The Garrison Co.';
    
    -- If cafe doesn't exist, create it
    IF garrison_co_cafe_id IS NULL THEN
        INSERT INTO public.cafes (
            id,
            name,
            type,
            description,
            location,
            phone,
            hours,
            accepting_orders,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            'The Garrison Co.',
            'Chinese & Asian Cuisine',
            'Authentic Chinese and Asian cuisine featuring a wide variety of soups, appetizers, noodles, rice dishes, and main courses. From classic hot and sour soups to flavorful schezwan preparations, our menu offers both vegetarian and non-vegetarian options. Specializing in dimsum, spring rolls, and combo meals that bring the best of Asian flavors to your table!',
            'Ground Floor, GHS',
            '+91-XXXXXXXXXX',
            '11:00 AM - 11:00 PM',
            true,
            NOW(),
            NOW()
        );
        
        -- Get the newly created cafe ID
        SELECT id INTO garrison_co_cafe_id FROM public.cafes WHERE name = 'The Garrison Co.';
    END IF;
    
    -- Clear existing menu items for The Garrison Co.
    DELETE FROM public.menu_items WHERE cafe_id = garrison_co_cafe_id;
    
    -- ========================================
    -- SOUP VEG
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (garrison_co_cafe_id, 'Veg Sweet Corn Soup', 'Classic sweet corn soup', 105, 'Soup Veg', true),
    (garrison_co_cafe_id, 'Veg Hot and Sour Soup', 'Spicy and tangy hot and sour soup', 105, 'Soup Veg', true),
    (garrison_co_cafe_id, 'Veg Clear Soup', 'Light and clear vegetable soup', 105, 'Soup Veg', true),
    (garrison_co_cafe_id, 'Veg Canton Corn Soup', 'Canton style corn soup', 105, 'Soup Veg', true),
    (garrison_co_cafe_id, 'Veg Manchow Soup', 'Spicy manchow soup', 125, 'Soup Veg', true),
    (garrison_co_cafe_id, 'Veg Hot & Sour Dumpling Soup', 'Hot and sour soup with dumplings - NEW!', 130, 'Soup Veg', true),
    (garrison_co_cafe_id, 'Veg Lemon Coriander Soup', 'Refreshing lemon coriander soup - NEW!', 115, 'Soup Veg', true);

    -- ========================================
    -- SOUP NON VEG
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (garrison_co_cafe_id, 'Chicken Sweet Corn Soup', 'Chicken sweet corn soup', 160, 'Soup Non Veg', true),
    (garrison_co_cafe_id, 'Chicken Hot & Sour Soup', 'Spicy chicken hot and sour soup', 160, 'Soup Non Veg', true),
    (garrison_co_cafe_id, 'Chicken Clear Soup', 'Light chicken clear soup', 160, 'Soup Non Veg', true),
    (garrison_co_cafe_id, 'Chicken Canton Corn Soup', 'Chicken canton style corn soup', 160, 'Soup Non Veg', true),
    (garrison_co_cafe_id, 'Minced Chicken Coriander Soup', 'Minced chicken with coriander soup', 160, 'Soup Non Veg', true),
    (garrison_co_cafe_id, 'Chicken Manchow Soup', 'Spicy chicken manchow soup', 175, 'Soup Non Veg', true),
    (garrison_co_cafe_id, 'Chicken Hot & Sour Dumpling Soup', 'Chicken hot and sour soup with dumplings - NEW!', 190, 'Soup Non Veg', true);

    -- ========================================
    -- APPETIZERS VEG
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (garrison_co_cafe_id, 'French Fries', 'Classic french fries', 120, 'Appetizers Veg', true),
    (garrison_co_cafe_id, 'Peri Peri Fries', 'Spicy peri peri fries', 140, 'Appetizers Veg', true),
    (garrison_co_cafe_id, 'Veg Spring Roll', 'Crispy vegetable spring roll', 150, 'Appetizers Veg', true),
    (garrison_co_cafe_id, 'Veg Salt and Pepper', 'Salt and pepper vegetables', 150, 'Appetizers Veg', true),
    (garrison_co_cafe_id, 'Crispy Chilly Potato', 'Crispy spicy potato', 155, 'Appetizers Veg', true),
    (garrison_co_cafe_id, 'Honey Chilly Potato', 'Sweet and spicy honey potato', 155, 'Appetizers Veg', true),
    (garrison_co_cafe_id, 'Baby Corn Mushroom Salt and Pepper', 'Baby corn and mushroom with salt and pepper', 195, 'Appetizers Veg', true),
    (garrison_co_cafe_id, 'Chilly Paneer Dry', 'Spicy paneer preparation', 195, 'Appetizers Veg', true),
    (garrison_co_cafe_id, 'Veg Manchurian Dry', 'Vegetable manchurian dry style', 160, 'Appetizers Veg', true),
    (garrison_co_cafe_id, 'Crispy Corn Pepper Salt', 'Crispy corn with pepper and salt', 195, 'Appetizers Veg', true),
    (garrison_co_cafe_id, 'Broccoli Manchurian Dry', 'Broccoli manchurian dry style', 195, 'Appetizers Veg', true),
    (garrison_co_cafe_id, 'Gobhi Manchurian Dry', 'Cauliflower manchurian dry style', 185, 'Appetizers Veg', true),
    (garrison_co_cafe_id, 'Chilly Baby Corn Dry', 'Spicy baby corn dry style', 195, 'Appetizers Veg', true),
    (garrison_co_cafe_id, 'Chilli Mushroom Dry', 'Spicy mushroom dry style', 195, 'Appetizers Veg', true);

    -- ========================================
    -- APPETIZERS NON VEG
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (garrison_co_cafe_id, 'Chicken Spring Roll', 'Crispy chicken spring roll', 195, 'Appetizers Non Veg', true),
    (garrison_co_cafe_id, 'Chicken Lollypop', 'Chicken lollypop', 265, 'Appetizers Non Veg', true),
    (garrison_co_cafe_id, 'Chilly Chicken Dry', 'Spicy chicken dry style', 265, 'Appetizers Non Veg', true),
    (garrison_co_cafe_id, 'Crispy Wings', 'Crispy chicken wings', 265, 'Appetizers Non Veg', true),
    (garrison_co_cafe_id, 'Drums of Heaven', 'Special chicken drumsticks', 320, 'Appetizers Non Veg', true),
    (garrison_co_cafe_id, 'Chicken Manchurian Dry', 'Chicken manchurian dry style', 265, 'Appetizers Non Veg', true),
    (garrison_co_cafe_id, 'Chicken Salt and Pepper', 'Chicken with salt and pepper', 265, 'Appetizers Non Veg', true),
    (garrison_co_cafe_id, 'Honey Chicken', 'Sweet honey chicken', 280, 'Appetizers Non Veg', true),
    (garrison_co_cafe_id, 'Sesame Fried Chicken', 'Sesame coated fried chicken', 280, 'Appetizers Non Veg', true),
    (garrison_co_cafe_id, 'Dragon Chicken', 'Dragon style chicken', 280, 'Appetizers Non Veg', true),
    (garrison_co_cafe_id, 'Chicken 65', 'Classic chicken 65', 265, 'Appetizers Non Veg', true),
    (garrison_co_cafe_id, 'Wings 65', 'Chicken wings 65 style', 285, 'Appetizers Non Veg', true);

    -- ========================================
    -- NOODLES/RICE
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (garrison_co_cafe_id, 'Veg Chopsuey', 'Vegetable chopsuey', 135, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'American Choupsey (Non-Veg)', 'American style non-veg chopsuey', 225, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Plain Rice', 'Steamed plain rice', 115, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Paneer Fried Rice', 'Paneer fried rice', 155, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Veg Fried Rice', 'Vegetable fried rice', 135, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Egg Fried Rice', 'Egg fried rice', 155, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Chicken Fried Rice', 'Chicken fried rice', 185, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Veg Schezwan Fried Rice', 'Spicy schezwan vegetable fried rice', 145, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Egg Schezwan Fried Rice', 'Spicy schezwan egg fried rice', 175, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Chicken Schezwan Fried Rice', 'Spicy schezwan chicken fried rice', 195, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Veg Shanghai Fried Rice', 'Shanghai style vegetable fried rice', 155, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Egg Shanghai Fried Rice', 'Shanghai style egg fried rice', 185, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Chicken Shanghai Fried Rice', 'Shanghai style chicken fried rice', 210, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Veg Triple Schezwan Fried Rice', 'Triple spicy schezwan vegetable fried rice', 155, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Egg Triple Schezwan Fried Rice', 'Triple spicy schezwan egg fried rice', 185, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Chicken Triple Schezwan Fried Rice', 'Triple spicy schezwan chicken fried rice', 215, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Veg Tomato Mushroom Fried Rice', 'Tomato mushroom vegetable fried rice', 145, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Egg Tomato Mushroom Fried Rice', 'Tomato mushroom egg fried rice', 170, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Chicken Tomato Mushroom Fried Rice', 'Tomato mushroom chicken fried rice', 200, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Tomato Chilly Coriander Fried Rice', 'Tomato chilly coriander fried rice', 140, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Egg Tomato Chilly Coriander Fried Rice', 'Egg tomato chilly coriander fried rice', 170, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Chicken Tomato Chilly Coriander Fried Rice', 'Chicken tomato chilly coriander fried rice', 200, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Veg Hakka Noodles', 'Vegetable hakka noodles', 130, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Egg Hakka Noodles', 'Egg hakka noodles', 160, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Chicken Hakka Noodles', 'Chicken hakka noodles', 190, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Veg Chowmein', 'Vegetable chowmein', 130, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Egg Chowmein', 'Egg chowmein', 160, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Chicken Chowmein', 'Chicken chowmein', 190, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Veg Chilly Garlic Noodles', 'Spicy chilly garlic vegetable noodles', 140, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Egg Chilly Garlic Noodles', 'Spicy chilly garlic egg noodles', 170, 'Noodles/Rice', true),
    (garrison_co_cafe_id, 'Chicken Chilly Garlic Noodles', 'Spicy chilly garlic chicken noodles', 200, 'Noodles/Rice', true);

    -- ========================================
    -- NOODLES
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (garrison_co_cafe_id, 'Veg Schezwan Noodles', 'Spicy schezwan vegetable noodles', 145, 'Noodles', true),
    (garrison_co_cafe_id, 'Egg Schezwan Noodles', 'Spicy schezwan egg noodles', 175, 'Noodles', true),
    (garrison_co_cafe_id, 'Chicken Schezwan Noodles', 'Spicy schezwan chicken noodles', 200, 'Noodles', true),
    (garrison_co_cafe_id, 'Veg Garlic Fried Rice', 'Garlic flavored vegetable fried rice', 140, 'Noodles', true),
    (garrison_co_cafe_id, 'Egg Garlic Fried Rice', 'Garlic flavored egg fried rice', 170, 'Noodles', true),
    (garrison_co_cafe_id, 'Chicken Garlic Fried Rice', 'Garlic flavored chicken fried rice', 195, 'Noodles', true);

    -- ========================================
    -- MAIN COURSE VEG
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (garrison_co_cafe_id, 'Veg Manchurian Gravy', 'Vegetable manchurian in gravy', 185, 'Main Course Veg', true),
    (garrison_co_cafe_id, 'Paneer Chilly Gravy', 'Spicy paneer chilly in gravy', 205, 'Main Course Veg', true),
    (garrison_co_cafe_id, 'Veg Hot Garlic Sauce', 'Vegetables in hot garlic sauce', 185, 'Main Course Veg', true),
    (garrison_co_cafe_id, 'Gobhi Manchurian Gravy', 'Cauliflower manchurian in gravy', 185, 'Main Course Veg', true),
    (garrison_co_cafe_id, 'Broccoli Manchurian Gravy', 'Broccoli manchurian in gravy', 195, 'Main Course Veg', true);

    -- ========================================
    -- MAIN COURSE NON VEG
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (garrison_co_cafe_id, 'Chilly Chicken Gravy', 'Spicy chilly chicken in gravy', 270, 'Main Course Non Veg', true),
    (garrison_co_cafe_id, 'Chicken Hot Garlic Sauce', 'Chicken in hot garlic sauce', 270, 'Main Course Non Veg', true),
    (garrison_co_cafe_id, 'Chicken Mangolian Wet', 'Chicken mangolian in gravy', 270, 'Main Course Non Veg', true),
    (garrison_co_cafe_id, 'Chicken Manchurian Gravy', 'Chicken manchurian in gravy', 270, 'Main Course Non Veg', true),
    (garrison_co_cafe_id, 'Chicken Schezwan Style Sauce', 'Chicken in schezwan style sauce', 280, 'Main Course Non Veg', true);

    -- ========================================
    -- DIMSUM (MOMOS)
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (garrison_co_cafe_id, 'Veg Dimsum', 'Vegetable dimsum', 135, 'Dimsum (Momos)', true),
    (garrison_co_cafe_id, 'Veg Schezwan Dimsum', 'Spicy schezwan vegetable dimsum', 145, 'Dimsum (Momos)', true),
    (garrison_co_cafe_id, 'Chicken Dimsum', 'Chicken dimsum', 185, 'Dimsum (Momos)', true),
    (garrison_co_cafe_id, 'Chicken Schezwan Dimsum', 'Spicy schezwan chicken dimsum', 195, 'Dimsum (Momos)', true);

    -- ========================================
    -- COMBO MEAL VEG
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (garrison_co_cafe_id, 'Manchurian Combo', 'Manchurian combo with choice of rice/noodles', 210, 'Combo Meal Veg', true),
    (garrison_co_cafe_id, 'Hot Garlic Sauce Combo', 'Hot garlic sauce combo with choice of rice/noodles', 210, 'Combo Meal Veg', true),
    (garrison_co_cafe_id, 'Paneer Chilly Combo', 'Paneer chilly combo with choice of rice/noodles', 220, 'Combo Meal Veg', true);

    -- ========================================
    -- COMBO MEAL NON VEG
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (garrison_co_cafe_id, 'Chilly Chicken Combo', 'Chilly chicken combo with choice of rice/noodles', 250, 'Combo Meal Non Veg', true),
    (garrison_co_cafe_id, 'Chicken Hot Garlic Sauce Combo', 'Chicken hot garlic sauce combo with choice of rice/noodles', 250, 'Combo Meal Non Veg', true),
    (garrison_co_cafe_id, 'Chicken Manchurian Gravy Combo', 'Chicken manchurian gravy combo with choice of rice/noodles', 250, 'Combo Meal Non Veg', true),
    (garrison_co_cafe_id, 'Chicken Mangolian Wet with Rice', 'Chicken mangolian wet with rice', 270, 'Combo Meal Non Veg', true);

    -- ========================================
    -- GARRISON SPECIAL COMBO MEALS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (garrison_co_cafe_id, 'Chicken Fried Rice + Spring Roll + Coke + Gravy Choice', 'Chicken fried rice with 1 piece chicken spring roll, small coke and choice of gravy (chilly chicken/manchurian/hot garlic sauce)', 325, 'Garrison Special Combo Meals', true),
    (garrison_co_cafe_id, 'Chicken Hakka Noodles + Spring Roll + Coke + Gravy Choice', 'Chicken hakka noodles with 1 piece chicken spring roll, small coke and choice of gravy (chilly chicken/manchurian/hot garlic sauce)', 325, 'Garrison Special Combo Meals', true);

    -- ========================================
    -- APPETIZERS COMBO VEG
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (garrison_co_cafe_id, 'Appetizers Combo Veg', '1 piece spring roll, 5 piece manchurian dry, 5 piece paneer chilly dry, half plate honey chilly potato, half plate peri peri fries, 1 400ml cold drink', 399, 'Appetizers Combo Veg', true);

    -- ========================================
    -- APPETIZERS COMBO NON VEG
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (garrison_co_cafe_id, 'Appetizers Combo Non Veg', '1 piece spring roll, 3 piece chicken wings, 3 piece chicken lollypop, 4 piece manchurian dry, 4 piece chilly chicken dry, 1 400ml cold drink', 685, 'Appetizers Combo Non Veg', true);

    RAISE NOTICE 'The Garrison Co. cafe successfully added/updated with % menu items', (SELECT COUNT(*) FROM public.menu_items WHERE cafe_id = garrison_co_cafe_id);
END $$;
