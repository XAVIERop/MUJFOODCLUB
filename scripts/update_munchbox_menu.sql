-- Update MUNCH BOX cafe menu with comprehensive menu from the provided images
-- Run this script directly in your Supabase SQL Editor

DO $$
DECLARE
    munchbox_cafe_id UUID;
BEGIN
    -- Get the Munch Box cafe ID
    SELECT id INTO munchbox_cafe_id FROM public.cafes WHERE name = 'Munch Box';
    
    -- If cafe doesn't exist, create it
    IF munchbox_cafe_id IS NULL THEN
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
            'Munch Box',
            'Multi-Cuisine & Fast Food',
            'Your ultimate destination for chaat, Chinese cuisine, momos, pizzas, and more! From traditional Delhi chaat to modern Chinese dishes, crispy momos to cheesy pizzas - we bring you the perfect blend of street food and restaurant quality. Experience the taste of India and beyond in every bite!',
            'G1 Ground Floor',
            '+91-9571688579',
            '11:00 AM - 2:00 AM',
            true,
            NOW(),
            NOW()
        );
        
        -- Get the newly created cafe ID
        SELECT id INTO munchbox_cafe_id FROM public.cafes WHERE name = 'Munch Box';
    END IF;
    
    -- Clear existing menu items for Munch Box
    DELETE FROM public.menu_items WHERE cafe_id = munchbox_cafe_id;
    
    -- ========================================
    -- CHAAT KA SWAG
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (munchbox_cafe_id, 'Dahi Puri', 'Crispy puris filled with yogurt, chutneys, and spices', 60, 'Chaat Ka Swag', true),
    (munchbox_cafe_id, 'Papdi Chaat', 'Crispy papdis topped with yogurt, chutneys, and sev', 70, 'Chaat Ka Swag', true),
    (munchbox_cafe_id, 'Bhalla Papdi Chaat', 'Soft bhallas with papdi, yogurt, and chutneys', 90, 'Chaat Ka Swag', true),
    (munchbox_cafe_id, 'Dahi Vada', 'Soft lentil dumplings in yogurt with chutneys', 90, 'Chaat Ka Swag', true),
    (munchbox_cafe_id, 'Kanji Vada', 'Spicy kanji vada with tangy flavors', 80, 'Chaat Ka Swag', true),
    (munchbox_cafe_id, 'Raj Kachori', 'Large crispy kachori filled with all chaat toppings', 110, 'Chaat Ka Swag', true);

    -- ========================================
    -- DILLI KI CHAAT
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (munchbox_cafe_id, 'Chole Bhature', 'Classic Delhi style chole with fluffy bhature', 110, 'Dilli Ki Chaat', true),
    (munchbox_cafe_id, 'Aloo Tikki Chaat', 'Spicy potato tikki with chutneys and yogurt', 50, 'Dilli Ki Chaat', true),
    (munchbox_cafe_id, 'Chole Tikki Chaat', 'Chole topped tikki with chutneys and yogurt', 70, 'Dilli Ki Chaat', true),
    (munchbox_cafe_id, 'Chole Kulcha (Matar Kulcha)', 'Chole with soft kulcha bread', 60, 'Dilli Ki Chaat', true),
    (munchbox_cafe_id, 'Paneer Pakoda', 'Crispy paneer pakodas', 130, 'Dilli Ki Chaat', true),
    (munchbox_cafe_id, 'Extra Bhatura', 'Additional bhatura bread', 40, 'Dilli Ki Chaat', true),
    (munchbox_cafe_id, 'Extra Kulcha', 'Additional kulcha bread', 15, 'Dilli Ki Chaat', true);

    -- ========================================
    -- BOMBAY MASALA CHAAT
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (munchbox_cafe_id, 'Vada Pao', 'Classic Bombay vada pao with green chutney', 30, 'Bombay Masala Chaat', true),
    (munchbox_cafe_id, 'Pav Bhaji', 'Spicy mixed vegetable bhaji with soft pav', 90, 'Bombay Masala Chaat', true),
    (munchbox_cafe_id, 'Cheese Pav Bhaji', 'Cheese topped pav bhaji', 120, 'Bombay Masala Chaat', true),
    (munchbox_cafe_id, 'Extra Pao', 'Additional pav bread', 20, 'Bombay Masala Chaat', true),
    (munchbox_cafe_id, 'Extra Cheese Masala Pao', 'Additional cheese masala pav', 40, 'Bombay Masala Chaat', true);

    -- ========================================
    -- NAWABI CHAAT
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (munchbox_cafe_id, 'Aloo Laccha Chaat', 'Crispy shredded potato chaat', 120, 'Nawabi Chaat', true),
    (munchbox_cafe_id, 'Bedai Poori Bhaji', 'Bedai poori with spicy bhaji', 110, 'Nawabi Chaat', true),
    (munchbox_cafe_id, 'Poori Bhaji', 'Soft pooris with spicy bhaji', 130, 'Nawabi Chaat', true),
    (munchbox_cafe_id, 'Fruit Chaat', 'Fresh fruit chaat with spices', 60, 'Nawabi Chaat', true),
    (munchbox_cafe_id, 'Fruit Cream Chaat', 'Fruit chaat with cream', 80, 'Nawabi Chaat', true),
    (munchbox_cafe_id, 'Doodh Jalabii', 'Sweet milk with crispy jalebis', 90, 'Nawabi Chaat', true);

    -- ========================================
    -- MUNCH BOX (APPETIZERS/STARTERS)
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (munchbox_cafe_id, 'Chilli Potato', 'Spicy chilli potato', 130, 'Munch Box Appetizers', true),
    (munchbox_cafe_id, 'Honey Chilli Potato', 'Sweet and spicy honey chilli potato', 140, 'Munch Box Appetizers', true),
    (munchbox_cafe_id, 'Chilli Paneer (Dry)', 'Spicy chilli paneer dry style', 180, 'Munch Box Appetizers', true),
    (munchbox_cafe_id, 'Chilli Paneer (Gravy)', 'Spicy chilli paneer in gravy', 200, 'Munch Box Appetizers', true),
    (munchbox_cafe_id, 'Chilli Mushroom (Dry)', 'Spicy chilli mushroom dry style', 180, 'Munch Box Appetizers', true),
    (munchbox_cafe_id, 'Chilli Mushroom (Gravy)', 'Spicy chilli mushroom in gravy', 200, 'Munch Box Appetizers', true),
    (munchbox_cafe_id, 'Veg Manchurian (Dry)', 'Vegetable manchurian dry style', 150, 'Munch Box Appetizers', true),
    (munchbox_cafe_id, 'Veg Manchurian (Gravy)', 'Vegetable manchurian in gravy', 170, 'Munch Box Appetizers', true),
    (munchbox_cafe_id, 'Crispy Corn Salt & Pepper', 'Crispy corn with salt and pepper', 180, 'Munch Box Appetizers', true),
    (munchbox_cafe_id, 'Veg Spring Roll', 'Crispy vegetable spring roll', 110, 'Munch Box Appetizers', true),
    (munchbox_cafe_id, 'Paneer Spring Roll', 'Crispy paneer spring roll', 130, 'Munch Box Appetizers', true);

    -- ========================================
    -- NOODLES
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (munchbox_cafe_id, 'Chowmin - Paneer', 'Paneer chowmein', 130, 'Noodles', true),
    (munchbox_cafe_id, 'Chowmin - Veg', 'Vegetable chowmein', 110, 'Noodles', true),
    (munchbox_cafe_id, 'Hakka Noodles - Mushroom', 'Mushroom hakka noodles', 150, 'Noodles', true),
    (munchbox_cafe_id, 'Hakka Noodles - Paneer', 'Paneer hakka noodles', 140, 'Noodles', true),
    (munchbox_cafe_id, 'Hakka Noodles - Veg', 'Vegetable hakka noodles', 120, 'Noodles', true),
    (munchbox_cafe_id, 'Chilli Garlic Noodles - Mushroom', 'Spicy chilli garlic mushroom noodles', 160, 'Noodles', true),
    (munchbox_cafe_id, 'Chilli Garlic Noodles - Paneer', 'Spicy chilli garlic paneer noodles', 150, 'Noodles', true),
    (munchbox_cafe_id, 'Chilli Garlic Noodles - Veg', 'Spicy chilli garlic vegetable noodles', 130, 'Noodles', true),
    (munchbox_cafe_id, 'Schezwan Noodle - Mushroom', 'Spicy schezwan mushroom noodles', 170, 'Noodles', true),
    (munchbox_cafe_id, 'Schezwan Noodle - Paneer', 'Spicy schezwan paneer noodles', 160, 'Noodles', true),
    (munchbox_cafe_id, 'Schezwan Noodle - Veg', 'Spicy schezwan vegetable noodles', 140, 'Noodles', true),
    (munchbox_cafe_id, 'Broccoli & Corn Noodle - Mushroom', 'Broccoli and corn mushroom noodles', 160, 'Noodles', true),
    (munchbox_cafe_id, 'Broccoli & Corn Noodle - Paneer', 'Broccoli and corn paneer noodles', 150, 'Noodles', true),
    (munchbox_cafe_id, 'Broccoli & Corn Noodle - Veg', 'Broccoli and corn vegetable noodles', 130, 'Noodles', true);

    -- ========================================
    -- SIMPLE SOUP
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (munchbox_cafe_id, 'Tomato Soup', 'Classic tomato soup', 80, 'Simple Soup', true),
    (munchbox_cafe_id, 'Sweet Corn Soup', 'Creamy sweet corn soup', 90, 'Simple Soup', true),
    (munchbox_cafe_id, 'Manchow Soup', 'Spicy manchow soup', 110, 'Simple Soup', true),
    (munchbox_cafe_id, 'Hot & Sour Soup', 'Tangy hot and sour soup', 110, 'Simple Soup', true);

    -- ========================================
    -- RICE
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (munchbox_cafe_id, 'Plain Rice - Veg', 'Steamed plain rice', 100, 'Rice', true),
    (munchbox_cafe_id, 'Fried Rice - Mushroom', 'Mushroom fried rice', 150, 'Rice', true),
    (munchbox_cafe_id, 'Fried Rice - Paneer', 'Paneer fried rice', 140, 'Rice', true),
    (munchbox_cafe_id, 'Fried Rice - Veg', 'Vegetable fried rice', 120, 'Rice', true),
    (munchbox_cafe_id, 'Chilli Garlic Fried Rice - Mushroom', 'Spicy chilli garlic mushroom fried rice', 170, 'Rice', true),
    (munchbox_cafe_id, 'Chilli Garlic Fried Rice - Paneer', 'Spicy chilli garlic paneer fried rice', 160, 'Rice', true),
    (munchbox_cafe_id, 'Chilli Garlic Fried Rice - Veg', 'Spicy chilli garlic vegetable fried rice', 140, 'Rice', true),
    (munchbox_cafe_id, 'Schezwan Fried Rice - Mushroom', 'Spicy schezwan mushroom fried rice', 160, 'Rice', true),
    (munchbox_cafe_id, 'Schezwan Fried Rice - Paneer', 'Spicy schezwan paneer fried rice', 150, 'Rice', true),
    (munchbox_cafe_id, 'Schezwan Fried Rice - Veg', 'Spicy schezwan vegetable fried rice', 130, 'Rice', true),
    (munchbox_cafe_id, 'Broccoli & Corn Rice - Mushroom', 'Broccoli and corn mushroom rice', 160, 'Rice', true),
    (munchbox_cafe_id, 'Broccoli & Corn Rice - Paneer', 'Broccoli and corn paneer rice', 150, 'Rice', true),
    (munchbox_cafe_id, 'Broccoli & Corn Rice - Veg', 'Broccoli and corn vegetable rice', 130, 'Rice', true);

    -- ========================================
    -- GRAVY MOMOS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (munchbox_cafe_id, 'Chilli Garlic Gravy - Veg', 'Veg momos in chilli garlic gravy', 130, 'Gravy Momos', true),
    (munchbox_cafe_id, 'Chilli Garlic Gravy - Paneer', 'Paneer momos in chilli garlic gravy', 150, 'Gravy Momos', true),
    (munchbox_cafe_id, 'Schezwan Chilli Gravy - Veg', 'Veg momos in schezwan chilli gravy', 130, 'Gravy Momos', true),
    (munchbox_cafe_id, 'Schezwan Chilli Gravy - Paneer', 'Paneer momos in schezwan chilli gravy', 150, 'Gravy Momos', true),
    (munchbox_cafe_id, 'Tandoori Masala Gravy - Veg', 'Veg momos in tandoori masala gravy', 140, 'Gravy Momos', true),
    (munchbox_cafe_id, 'Tandoori Masala Gravy - Paneer', 'Paneer momos in tandoori masala gravy', 160, 'Gravy Momos', true),
    (munchbox_cafe_id, 'Afgani Style Momos - Veg', 'Veg momos in Afghani style gravy', 140, 'Gravy Momos', true),
    (munchbox_cafe_id, 'Afgani Style Momos - Paneer', 'Paneer momos in Afghani style gravy', 160, 'Gravy Momos', true),
    (munchbox_cafe_id, 'Peri-Peri Momos - Veg', 'Veg momos in peri peri gravy', 130, 'Gravy Momos', true),
    (munchbox_cafe_id, 'Peri-Peri Momos - Paneer', 'Paneer momos in peri peri gravy', 150, 'Gravy Momos', true),
    (munchbox_cafe_id, 'Makhani Malai Momos - Veg', 'Veg momos in makhani malai gravy', 140, 'Gravy Momos', true),
    (munchbox_cafe_id, 'Makhani Malai Momos - Paneer', 'Paneer momos in makhani malai gravy', 160, 'Gravy Momos', true);

    -- ========================================
    -- TANDOORI MOMOS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (munchbox_cafe_id, 'Tandoori Masala Roasted - Paneer', 'Paneer momos roasted in tandoori masala', 230, 'Tandoori Momos', true),
    (munchbox_cafe_id, 'Tandoori Masala Roasted - Veg', 'Veg momos roasted in tandoori masala', 210, 'Tandoori Momos', true),
    (munchbox_cafe_id, 'Afgani Tandoori Roasted - Paneer', 'Paneer momos roasted in Afghani style', 250, 'Tandoori Momos', true),
    (munchbox_cafe_id, 'Afgani Tandoori Roasted - Veg', 'Veg momos roasted in Afghani style', 220, 'Tandoori Momos', true),
    (munchbox_cafe_id, 'Achari Tandoori Roasted - Paneer', 'Paneer momos roasted in achari style', 230, 'Tandoori Momos', true),
    (munchbox_cafe_id, 'Achari Tandoori Roasted - Veg', 'Veg momos roasted in achari style', 210, 'Tandoori Momos', true),
    (munchbox_cafe_id, 'Poodina Tandoori Roasted - Paneer', 'Paneer momos roasted in pudina style', 250, 'Tandoori Momos', true),
    (munchbox_cafe_id, 'Poodina Tandoori Roasted - Veg', 'Veg momos roasted in pudina style', 230, 'Tandoori Momos', true),
    (munchbox_cafe_id, 'Masala Cheese Tandoori Roasted - Paneer', 'Paneer momos roasted with masala cheese', 270, 'Tandoori Momos', true),
    (munchbox_cafe_id, 'Masala Cheese Tandoori Roasted - Veg', 'Veg momos roasted with masala cheese', 250, 'Tandoori Momos', true),
    (munchbox_cafe_id, 'Jhol Momos - Paneer', 'Paneer momos in spicy jhol', 190, 'Tandoori Momos', true),
    (munchbox_cafe_id, 'Jhol Momos - Veg', 'Veg momos in spicy jhol', 160, 'Tandoori Momos', true);

    -- ========================================
    -- MOMOS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (munchbox_cafe_id, 'Veg Momos - Steam', 'Steamed vegetable momos', 90, 'Momos', true),
    (munchbox_cafe_id, 'Veg Momos - Fried', 'Fried vegetable momos', 100, 'Momos', true),
    (munchbox_cafe_id, 'Veg Momos - Kurkure', 'Crispy kurkure style vegetable momos', 140, 'Momos', true),
    (munchbox_cafe_id, 'Paneer Momos - Steam', 'Steamed paneer momos', 110, 'Momos', true),
    (munchbox_cafe_id, 'Paneer Momos - Fried', 'Fried paneer momos', 130, 'Momos', true),
    (munchbox_cafe_id, 'Paneer Momos - Kurkure', 'Crispy kurkure style paneer momos', 150, 'Momos', true);

    -- ========================================
    -- CHINESE COMBO
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (munchbox_cafe_id, 'Veg Manchurian Combo (210)', 'Hakka Noodles + Momos (2pc) or Chilli Garlic Noodle + Momos (2pc) or Schezwan Noodle + Momos (2pc) or Chowmin + Momos (2pc)', 210, 'Chinese Combo', true),
    (munchbox_cafe_id, 'Chilli Paneer Combo (230)', 'Hakka Noodles + Momos (2pc) or Chilli Garlic Noodle + Momos (2pc) or Schezwan Noodle + Momos (2pc) or Chowmin + Momos (2pc)', 230, 'Chinese Combo', true),
    (munchbox_cafe_id, 'Veg Manchurian Combo (250)', 'Veg Fried Rice + Momos (2pc) or Chilli Garlic Rice + Momos (2pc) or Schezwan Rice + Momos (2pc)', 250, 'Chinese Combo', true),
    (munchbox_cafe_id, 'Chilli Paneer Combo (280)', 'Veg Fried Rice + Momos (2pc) or Chilli Garlic Rice + Momos (2pc)', 280, 'Chinese Combo', true);

    -- ========================================
    -- PIZZA AND FRIES
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (munchbox_cafe_id, 'Farm Fresh Pizza (9 inch)', 'Fresh farm vegetables pizza - 9 inch', 110, 'Pizza and Fries', true),
    (munchbox_cafe_id, 'Farm Fresh Pizza (11 inch)', 'Fresh farm vegetables pizza - 11 inch', 220, 'Pizza and Fries', true),
    (munchbox_cafe_id, 'Say Cheese Pizza (9 inch)', 'Extra cheesy pizza - 9 inch', 110, 'Pizza and Fries', true),
    (munchbox_cafe_id, 'Say Cheese Pizza (11 inch)', 'Extra cheesy pizza - 11 inch', 220, 'Pizza and Fries', true),
    (munchbox_cafe_id, 'Peppy Paneer Pizza (9 inch)', 'Spicy paneer pizza - 9 inch', 110, 'Pizza and Fries', true),
    (munchbox_cafe_id, 'Peppy Paneer Pizza (11 inch)', 'Spicy paneer pizza - 11 inch', 220, 'Pizza and Fries', true),
    (munchbox_cafe_id, 'Veggie Supreme Pizza (9 inch)', 'Supreme vegetable pizza - 9 inch', 120, 'Pizza and Fries', true),
    (munchbox_cafe_id, 'Veggie Supreme Pizza (11 inch)', 'Supreme vegetable pizza - 11 inch', 230, 'Pizza and Fries', true),
    (munchbox_cafe_id, 'Tandoori Paneer Pizza (9 inch)', 'Tandoori style paneer pizza - 9 inch', 170, 'Pizza and Fries', true),
    (munchbox_cafe_id, 'Tandoori Paneer Pizza (11 inch)', 'Tandoori style paneer pizza - 11 inch', 310, 'Pizza and Fries', true),
    (munchbox_cafe_id, 'Cheesy Corn & Jalapeno Pizza (9 inch)', 'Cheesy corn and jalapeno pizza - 9 inch', 170, 'Pizza and Fries', true),
    (munchbox_cafe_id, 'Cheesy Corn & Jalapeno Pizza (11 inch)', 'Cheesy corn and jalapeno pizza - 11 inch', 310, 'Pizza and Fries', true),
    (munchbox_cafe_id, 'Salted Fries', 'Classic salted french fries', 90, 'Pizza and Fries', true),
    (munchbox_cafe_id, 'Masala Fries', 'Spicy masala fries', 100, 'Pizza and Fries', true),
    (munchbox_cafe_id, 'Peri-Peri Fries', 'Spicy peri peri fries', 110, 'Pizza and Fries', true),
    (munchbox_cafe_id, 'Cheese Loaded Fries', 'Cheese topped french fries', 140, 'Pizza and Fries', true);

    -- ========================================
    -- WRAPS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (munchbox_cafe_id, 'Creamy Cheese Potato Wrap', 'Creamy cheese and potato wrap', 130, 'Wraps', true),
    (munchbox_cafe_id, 'Peri-Peri Veg Wrap', 'Spicy peri peri vegetable wrap', 120, 'Wraps', true),
    (munchbox_cafe_id, 'Cheesy Veg Wrap', 'Cheesy vegetable wrap', 130, 'Wraps', true),
    (munchbox_cafe_id, 'Veg Peri Peri Fusion Wrap', 'Peri peri fusion vegetable wrap', 130, 'Wraps', true),
    (munchbox_cafe_id, 'Paneer Fusion Wrap', 'Paneer fusion wrap', 140, 'Wraps', true),
    (munchbox_cafe_id, 'Zesty Paneer Wrap', 'Zesty paneer wrap', 150, 'Wraps', true),
    (munchbox_cafe_id, 'Mexican Tortilla Wrap', 'Mexican style tortilla wrap', 140, 'Wraps', true);

    -- ========================================
    -- PASTA
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (munchbox_cafe_id, 'Red Sauce Pasta', 'Pasta in tangy red sauce', 190, 'Pasta', true),
    (munchbox_cafe_id, 'White Sauce Pasta', 'Pasta in creamy white sauce', 210, 'Pasta', true),
    (munchbox_cafe_id, 'Mix Sauce Pasta', 'Pasta in mixed sauce', 200, 'Pasta', true),
    (munchbox_cafe_id, 'Cheese Loaded Pasta', 'Extra cheesy pasta', 240, 'Pasta', true);

    -- ========================================
    -- ADD-ON-DIPS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (munchbox_cafe_id, 'Schezwan Dip', 'Spicy schezwan dip', 20, 'Add-on Dips', true),
    (munchbox_cafe_id, 'Mayonnaise Dip', 'Creamy mayonnaise dip', 20, 'Add-on Dips', true),
    (munchbox_cafe_id, 'Mint Chatni Dip', 'Fresh mint chutney dip', 20, 'Add-on Dips', true),
    (munchbox_cafe_id, 'Cheese Dip', 'Cheesy dip', 30, 'Add-on Dips', true);

    -- ========================================
    -- SWEET & BEVERAGES
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (munchbox_cafe_id, 'Cold Coffee', 'Classic cold coffee', 60, 'Sweet & Beverages', true),
    (munchbox_cafe_id, 'Cold Coffee with Ice Cream', 'Cold coffee topped with ice cream', 90, 'Sweet & Beverages', true),
    (munchbox_cafe_id, 'Brownie', 'Classic chocolate brownie', 60, 'Sweet & Beverages', true),
    (munchbox_cafe_id, 'Hot Brownie with Ice Cream', 'Warm brownie with ice cream', 90, 'Sweet & Beverages', true),
    (munchbox_cafe_id, 'Tea', 'Classic hot tea', 20, 'Sweet & Beverages', true),
    (munchbox_cafe_id, 'Kulhad Tea', 'Traditional kulhad tea', 30, 'Sweet & Beverages', true),
    (munchbox_cafe_id, 'Hot Coffee', 'Classic hot coffee', 30, 'Sweet & Beverages', true);

    RAISE NOTICE 'Munch Box cafe menu successfully updated with % menu items', (SELECT COUNT(*) FROM public.menu_items WHERE cafe_id = munchbox_cafe_id);
END $$;
