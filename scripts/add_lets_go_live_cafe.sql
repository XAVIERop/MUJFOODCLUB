-- Add LET'S GO LIVE cafe with comprehensive menu from the provided image
-- Run this script directly in your Supabase SQL Editor

DO $$
DECLARE
    lets_go_live_cafe_id UUID;
BEGIN
    -- Check if Let's Go Live cafe exists, if not create it
    SELECT id INTO lets_go_live_cafe_id FROM public.cafes WHERE name = 'Let''s Go Live';
    
    -- If cafe doesn't exist, create it
    IF lets_go_live_cafe_id IS NULL THEN
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
            'Let''s Go Live',
            'Multi-Cuisine & Live Kitchen',
            'Experience the ultimate food adventure with our extensive menu featuring customizable pastas, gourmet sandwiches, Mexican delights, and much more! From "Make Your Own Pasta" to specialty naanzas, we bring you fresh, flavorful dishes made to order. Our live kitchen ensures every meal is prepared with passion and precision!',
            'G2 Ground Floor',
            '+91-7340588261, +91-9166992102',
            '11:00 AM - 2:00 AM',
            true,
            NOW(),
            NOW()
        );
        
        -- Get the newly created cafe ID
        SELECT id INTO lets_go_live_cafe_id FROM public.cafes WHERE name = 'Let''s Go Live';
    END IF;
    
    -- Clear existing menu items for Let's Go Live
    DELETE FROM public.menu_items WHERE cafe_id = lets_go_live_cafe_id;
    
    -- ========================================
    -- MAKE YOUR OWN PASTA
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (lets_go_live_cafe_id, 'Make Your Own Pasta - Veg', 'Custom pasta with choice of pasta type, sauce, 3 vegetables, and toppings - Veg', 160, 'Make Your Own Pasta', true),
    (lets_go_live_cafe_id, 'Make Your Own Pasta - Non Veg', 'Custom pasta with choice of pasta type, sauce, 3 vegetables, 1 non-veg protein, and toppings', 190, 'Make Your Own Pasta', true);

    -- ========================================
    -- PASTAS (PRE-DEFINED)
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (lets_go_live_cafe_id, 'Pasta Bolognese Sauce - Veg', 'Pasta with rich bolognese sauce - vegetarian', 175, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Pasta Bolognese Sauce - Chicken', 'Pasta with rich bolognese sauce - chicken', 195, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Pasta Basil Pesto Sauce - Veg', 'Pasta with fresh basil pesto sauce - vegetarian', 175, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Pasta Basil Pesto Sauce - Chicken', 'Pasta with fresh basil pesto sauce - chicken', 195, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Peri Peri Pasta - Veg', 'Spicy peri peri pasta - vegetarian', 175, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Peri Peri Pasta - Chicken', 'Spicy peri peri pasta - chicken', 195, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Spaghetti Aglio E Olio - Veg', 'Classic garlic and oil spaghetti - vegetarian', 175, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Spaghetti Aglio E Olio - Chicken', 'Classic garlic and oil spaghetti - chicken', 195, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Paneer Tikka Pasta - Veg', 'Paneer tikka pasta - vegetarian', 175, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Chicken Tikka Pasta', 'Chicken tikka pasta', 195, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Cheesy Corn / Baked Pasta - Veg', 'Cheesy corn or baked pasta - vegetarian', 175, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Cheesy Corn / Baked Pasta - Chicken', 'Cheesy corn or baked pasta - chicken', 195, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Mushroom Sauce Pasta - Veg', 'Creamy mushroom sauce pasta - vegetarian', 175, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Mushroom Sauce Pasta - Chicken', 'Creamy mushroom sauce pasta - chicken', 195, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Spaghetti Meat Balls', 'Spaghetti with meatballs', 200, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Lasagne - Veg', 'Classic lasagne - vegetarian', 180, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Lasagne - Chicken', 'Classic lasagne - chicken', 200, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Cheesy Jalapeno Pasta - Veg', 'Spicy jalapeno pasta with cheese - vegetarian', 180, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Cheesy Jalapeno Pasta - Chicken', 'Spicy jalapeno pasta with cheese - chicken', 200, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Mac N Cheese / Malai Pasta - Veg', 'Mac and cheese or malai pasta - vegetarian', 180, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Mac N Cheese / Malai Pasta - Chicken', 'Mac and cheese or malai pasta - chicken', 200, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Cheesy Baked Spaghetti - Veg', 'Baked spaghetti with cheese - vegetarian', 180, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Cheesy Baked Spaghetti - Chicken', 'Baked spaghetti with cheese - chicken', 200, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Butter Paneer Pasta', 'Butter paneer pasta', 190, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Pasta Biryani - Veg', 'Pasta biryani style - vegetarian', 190, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Pasta Biryani - Chicken', 'Pasta biryani style - chicken', 210, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Butter Chicken Pasta', 'Butter chicken pasta', 200, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Loaded Cheese Lasagne', 'Extra cheesy loaded lasagne - vegetarian', 200, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Cheesy Spicy Garlic - Veg', 'Spicy garlic pasta with cheese - vegetarian', 200, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Cheesy Spicy Garlic - Chicken', 'Spicy garlic pasta with cheese - chicken', 220, 'Pastas (Pre-defined)', true),
    (lets_go_live_cafe_id, 'Cheesy Keema Macaroni', 'Keema macaroni with cheese', 220, 'Pastas (Pre-defined)', true);

    -- ========================================
    -- SANDWICHES
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (lets_go_live_cafe_id, 'Veg Cheese / Omlette Cheese', 'Vegetable cheese or omlette cheese sandwich', 60, 'Sandwiches', true),
    (lets_go_live_cafe_id, 'Veg Bombay SW / Corn Cheese SW / Aloo Tikki SW', 'Bombay style, corn cheese, or aloo tikki sandwich', 80, 'Sandwiches', true),
    (lets_go_live_cafe_id, 'Veg Kabab / Falafel / Mexican Patty', 'Vegetable kabab, falafel, or Mexican patty sandwich', 90, 'Sandwiches', true),
    (lets_go_live_cafe_id, 'BBQ Paneer / Chicken SW', 'BBQ paneer or chicken sandwich', 95, 'Sandwiches', true),
    (lets_go_live_cafe_id, 'Chicken Salami / Sausage SW', 'Chicken salami or sausage sandwich', 95, 'Sandwiches', true),
    (lets_go_live_cafe_id, 'Tikka - Paneer / Chicken SW', 'Paneer or chicken tikka sandwich', 95, 'Sandwiches', true),
    (lets_go_live_cafe_id, 'Mexican Paneer / Chicken SW', 'Mexican style paneer or chicken sandwich', 95, 'Sandwiches', true),
    (lets_go_live_cafe_id, 'Lebanese Paneer / Chicken SW', 'Lebanese style paneer or chicken sandwich', 95, 'Sandwiches', true),
    (lets_go_live_cafe_id, 'Italian Paneer / Chicken SW', 'Italian style paneer or chicken sandwich', 95, 'Sandwiches', true),
    (lets_go_live_cafe_id, 'Habanero Chicken / Paneer SW', 'Spicy habanero chicken or paneer sandwich', 100, 'Sandwiches', true),
    (lets_go_live_cafe_id, 'Basil Pesto Paneer / Chicken SW', 'Basil pesto paneer or chicken sandwich', 100, 'Sandwiches', true),
    (lets_go_live_cafe_id, 'Bhuna Masala - Paneer / Chicken', 'Bhuna masala paneer or chicken sandwich', 100, 'Sandwiches', true),
    (lets_go_live_cafe_id, 'Malai - Paneer / Chicken', 'Malai paneer or chicken sandwich', 100, 'Sandwiches', true),
    (lets_go_live_cafe_id, 'Kadhai - Chicken / Paneer', 'Kadhai style chicken or paneer sandwich', 100, 'Sandwiches', true),
    (lets_go_live_cafe_id, 'Paneer Bhurji / Chicken Keema', 'Paneer bhurji or chicken keema sandwich', 100, 'Sandwiches', true),
    (lets_go_live_cafe_id, 'Cheese Jalapeno SW - Chicken / Paneer Mushroom', 'Cheese jalapeno chicken or paneer mushroom sandwich', 100, 'Sandwiches', true),
    (lets_go_live_cafe_id, 'Chipotle Paneer / Chicken SW', 'Chipotle paneer or chicken sandwich', 100, 'Sandwiches', true),
    (lets_go_live_cafe_id, 'Sheekh Kabab / Spicy Mushroom', 'Sheekh kabab or spicy mushroom sandwich', 100, 'Sandwiches', true),
    (lets_go_live_cafe_id, 'Spicy Garlic SW - Paneer / Chicken', 'Spicy garlic paneer or chicken sandwich', 100, 'Sandwiches', true),
    (lets_go_live_cafe_id, 'Rainbow Paneer / Chicken SW', 'Rainbow paneer or chicken sandwich', 110, 'Sandwiches', true),
    (lets_go_live_cafe_id, 'Butter Chicken / Paneer SW', 'Butter chicken or paneer sandwich', 110, 'Sandwiches', true),
    (lets_go_live_cafe_id, 'Club SW - Paneer / Chicken', 'Club sandwich with paneer or chicken', 120, 'Sandwiches', true),
    (lets_go_live_cafe_id, 'Loaded Chicken / Loaded Paneer', 'Loaded chicken or paneer sandwich', 130, 'Sandwiches', true),
    (lets_go_live_cafe_id, 'Three Cheese - Chicken / Paneer Club SW', 'Three cheese club sandwich with chicken or paneer', 140, 'Sandwiches', true),
    (lets_go_live_cafe_id, 'Add Extra Cheese Slice', 'Extra cheese slice for sandwiches', 20, 'Sandwiches', true);

    -- ========================================
    -- BURGERS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (lets_go_live_cafe_id, 'Aloo Tikki / Veg Burger', 'Aloo tikki or vegetable burger', 60, 'Burgers', true),
    (lets_go_live_cafe_id, 'Falafel / Mexican Burger', 'Falafel or Mexican style burger', 80, 'Burgers', true),
    (lets_go_live_cafe_id, 'Paneer Tikka / Chicken Patty', 'Paneer tikka or chicken patty burger', 90, 'Burgers', true),
    (lets_go_live_cafe_id, 'Crunchy Chicken / Seekh Kabab', 'Crunchy chicken or seekh kabab burger', 100, 'Burgers', true),
    (lets_go_live_cafe_id, 'Paneer Patty', 'Paneer patty burger', 100, 'Burgers', true),
    (lets_go_live_cafe_id, 'Add Cheese Slice / Patty', 'Extra cheese slice or patty for burgers', 20, 'Burgers', true);

    -- ========================================
    -- HEALTHY
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (lets_go_live_cafe_id, 'Saute Veggies with - Paneer / Chicken', 'Sauteed vegetables with paneer or chicken', 150, 'Healthy', true),
    (lets_go_live_cafe_id, 'Saute Veggies', 'Sauteed vegetables', 110, 'Healthy', true);

    -- ========================================
    -- RICE
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (lets_go_live_cafe_id, 'Veg Fried Rice / Egg Fried Rice', 'Vegetable or egg fried rice', 120, 'Rice', true),
    (lets_go_live_cafe_id, 'Chicken Fried Rice', 'Chicken fried rice', 170, 'Rice', true),
    (lets_go_live_cafe_id, 'Add - Szechwan / Chili Garlic', 'Add szechwan or chili garlic flavor to rice', 20, 'Rice', true);

    -- ========================================
    -- MOMOS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (lets_go_live_cafe_id, 'Steamed Momos - Veg', 'Steamed vegetable momos', 80, 'Momos', true),
    (lets_go_live_cafe_id, 'Steamed Momos - Chicken/Paneer', 'Steamed chicken or paneer momos', 100, 'Momos', true),
    (lets_go_live_cafe_id, 'Tandoori Momos - Veg', 'Tandoori style vegetable momos', 100, 'Momos', true),
    (lets_go_live_cafe_id, 'Tandoori Momos - Chicken/Paneer', 'Tandoori style chicken or paneer momos', 120, 'Momos', true),
    (lets_go_live_cafe_id, 'Fried Momos - Veg', 'Fried vegetable momos', 100, 'Momos', true),
    (lets_go_live_cafe_id, 'Fried Momos - Chicken/Paneer', 'Fried chicken or paneer momos', 120, 'Momos', true),
    (lets_go_live_cafe_id, 'Chili Garlic Momos - Veg', 'Spicy chili garlic vegetable momos', 110, 'Momos', true),
    (lets_go_live_cafe_id, 'Chili Garlic Momos - Chicken/Paneer', 'Spicy chili garlic chicken or paneer momos', 130, 'Momos', true),
    (lets_go_live_cafe_id, 'BBQ Momos - Veg', 'BBQ style vegetable momos', 110, 'Momos', true),
    (lets_go_live_cafe_id, 'BBQ Momos - Chicken/Paneer', 'BBQ style chicken or paneer momos', 130, 'Momos', true),
    (lets_go_live_cafe_id, 'Peri Peri Momos - Veg', 'Peri peri style vegetable momos', 110, 'Momos', true),
    (lets_go_live_cafe_id, 'Peri Peri Momos - Chicken/Paneer', 'Peri peri style chicken or paneer momos', 130, 'Momos', true),
    (lets_go_live_cafe_id, 'Afghani Momos - Veg', 'Afghani style vegetable momos', 120, 'Momos', true),
    (lets_go_live_cafe_id, 'Afghani Momos - Chicken/Paneer', 'Afghani style chicken or paneer momos', 140, 'Momos', true),
    (lets_go_live_cafe_id, 'Cheesy Baked Momos - Veg', 'Cheesy baked vegetable momos', 120, 'Momos', true),
    (lets_go_live_cafe_id, 'Cheesy Baked Momos - Chicken/Paneer', 'Cheesy baked chicken or paneer momos', 140, 'Momos', true),
    (lets_go_live_cafe_id, 'Kurkure Momos - Veg', 'Crispy kurkure style vegetable momos', 120, 'Momos', true),
    (lets_go_live_cafe_id, 'Kurkure Momos - Chicken/Paneer', 'Crispy kurkure style chicken or paneer momos', 140, 'Momos', true);

    -- ========================================
    -- SIDES WITH DIP
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (lets_go_live_cafe_id, 'Garlic Bread', 'Classic garlic bread', 70, 'Sides with Dip', true),
    (lets_go_live_cafe_id, 'French Fries - Salted / Peri Peri', 'Salted or peri peri french fries', 80, 'Sides with Dip', true),
    (lets_go_live_cafe_id, 'Chili Garlic Poppers', 'Spicy chili garlic poppers', 90, 'Sides with Dip', true),
    (lets_go_live_cafe_id, 'Cheese Garlic Bread', 'Cheesy garlic bread', 100, 'Sides with Dip', true),
    (lets_go_live_cafe_id, 'Chicken Popcorn', 'Crispy chicken popcorn', 115, 'Sides with Dip', true),
    (lets_go_live_cafe_id, 'Chili Cheese Garlic Bread', 'Spicy chili cheese garlic bread', 120, 'Sides with Dip', true),
    (lets_go_live_cafe_id, 'Cheesy Fries', 'Cheese topped french fries', 125, 'Sides with Dip', true),
    (lets_go_live_cafe_id, 'Pizza Pockets', 'Delicious pizza pockets', 130, 'Sides with Dip', true),
    (lets_go_live_cafe_id, 'Bruschetta Paneer / Chicken', 'Paneer or chicken bruschetta', 130, 'Sides with Dip', true),
    (lets_go_live_cafe_id, 'Cheese Poppers', 'Cheesy poppers', 130, 'Sides with Dip', true),
    (lets_go_live_cafe_id, 'Veg Spring Rolls', 'Crispy vegetable spring rolls', 130, 'Sides with Dip', true),
    (lets_go_live_cafe_id, 'Peri Peri Cheesy Fries', 'Peri peri style cheesy fries', 130, 'Sides with Dip', true),
    (lets_go_live_cafe_id, 'Falafel Kababs', 'Crispy falafel kababs', 130, 'Sides with Dip', true),
    (lets_go_live_cafe_id, 'Chicken Poppers - Szechwan / Chili Garlic', 'Szechwan or chili garlic chicken poppers', 130, 'Sides with Dip', true),
    (lets_go_live_cafe_id, 'Chicken Fingers With Dip', 'Chicken fingers served with dip', 140, 'Sides with Dip', true),
    (lets_go_live_cafe_id, 'Chicken Strips - Regular / Peri Peri', 'Regular or peri peri chicken strips', 140, 'Sides with Dip', true),
    (lets_go_live_cafe_id, 'Chicken Nuggets / Corn', 'Chicken nuggets or corn', 140, 'Sides with Dip', true),
    (lets_go_live_cafe_id, 'Cheese Chicken Nuggets', 'Cheesy chicken nuggets', 140, 'Sides with Dip', true),
    (lets_go_live_cafe_id, 'Cheesy Fries with Chicken', 'Cheesy fries topped with chicken', 150, 'Sides with Dip', true),
    (lets_go_live_cafe_id, 'Chicken Cheese Balls', 'Cheesy chicken balls', 150, 'Sides with Dip', true),
    (lets_go_live_cafe_id, 'Chapli Kabab', 'Traditional chapli kabab', 150, 'Sides with Dip', true),
    (lets_go_live_cafe_id, 'Chicken Sheekh Kabab', 'Spicy chicken sheekh kabab', 150, 'Sides with Dip', true),
    (lets_go_live_cafe_id, 'Regular / Malai', 'Regular or malai style', 150, 'Sides with Dip', true);

    -- ========================================
    -- MAGGI / NOODLES
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (lets_go_live_cafe_id, 'Maggi - Plain / Veg / Veg Cheese', 'Plain, vegetable, or cheese vegetable maggi', 40, 'Maggi/Noodles', true),
    (lets_go_live_cafe_id, 'Maggi - Chicken / Chicken Cheese', 'Chicken or cheese chicken maggi', 70, 'Maggi/Noodles', true),
    (lets_go_live_cafe_id, 'Peri Peri Maggi - Veg / Chicken', 'Peri peri style vegetable or chicken maggi', 70, 'Maggi/Noodles', true),
    (lets_go_live_cafe_id, 'Tandoori Maggi - Veg / Chicken', 'Tandoori style vegetable or chicken maggi', 70, 'Maggi/Noodles', true),
    (lets_go_live_cafe_id, 'Szechwan Noodles', 'Spicy szechwan noodles', 70, 'Maggi/Noodles', true),
    (lets_go_live_cafe_id, 'Manchurian Noodles - Chicken / Veg', 'Chicken or vegetable manchurian noodles', 90, 'Maggi/Noodles', true);

    -- ========================================
    -- NAANZAS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (lets_go_live_cafe_id, 'Herb N Cheese / Corn N Cheese / OTC', 'Herb and cheese, corn and cheese, or OTC naanza', 190, 'Naanzas', true),
    (lets_go_live_cafe_id, 'Mushroom / Five Peppers', 'Mushroom or five peppers naanza', 210, 'Naanzas', true),
    (lets_go_live_cafe_id, 'Paneer / Chicken Tikka', 'Paneer or chicken tikka naanza', 220, 'Naanzas', true),
    (lets_go_live_cafe_id, 'Farm House', 'Farm house naanza', 220, 'Naanzas', true),
    (lets_go_live_cafe_id, 'Butter - Paneer / Chicken', 'Butter paneer or chicken naanza', 230, 'Naanzas', true),
    (lets_go_live_cafe_id, 'African - Paneer / Chicken', 'African style paneer or chicken naanza', 230, 'Naanzas', true),
    (lets_go_live_cafe_id, 'Keema - Paneer / Chicken', 'Keema paneer or chicken naanza', 230, 'Naanzas', true),
    (lets_go_live_cafe_id, 'BBQ - Paneer / Chicken', 'BBQ paneer or chicken naanza', 230, 'Naanzas', true),
    (lets_go_live_cafe_id, 'Loaded Paneer / Chicken', 'Loaded paneer or chicken naanza', 230, 'Naanzas', true),
    (lets_go_live_cafe_id, 'Malai Paneer / Chicken', 'Malai paneer or chicken naanza', 230, 'Naanzas', true),
    (lets_go_live_cafe_id, 'Five Chicken / Chicken Kabab', 'Five chicken or chicken kabab naanza', 270, 'Naanzas', true),
    (lets_go_live_cafe_id, 'Exotic - Paneer / Chicken', 'Exotic paneer or chicken naanza', 230, 'Naanzas', true),
    (lets_go_live_cafe_id, 'Three Cheese - Paneer / Chicken', 'Three cheese paneer or chicken naanza', 230, 'Naanzas', true);

    -- ========================================
    -- MEXICAN
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (lets_go_live_cafe_id, 'Paneer / Chicken Fajitas', 'Paneer or chicken fajitas', 170, 'Mexican', true),
    (lets_go_live_cafe_id, 'Burritos Paneer / Chicken', 'Paneer or chicken burritos', 130, 'Mexican', true),
    (lets_go_live_cafe_id, 'Nachos with Cheese - Paneer / Chicken', 'Cheese nachos with paneer or chicken', 130, 'Mexican', true),
    (lets_go_live_cafe_id, 'Quesadilla - Paneer / Chicken', 'Paneer or chicken quesadilla', 130, 'Mexican', true),
    (lets_go_live_cafe_id, 'BBQ - Paneer / Chicken Taco', 'BBQ paneer or chicken taco', 130, 'Mexican', true),
    (lets_go_live_cafe_id, 'Italian Mexican Paneer / Chicken Taco', 'Italian Mexican paneer or chicken taco', 130, 'Mexican', true),
    (lets_go_live_cafe_id, 'Chicken Sheekh Kabab Taco', 'Chicken sheekh kabab taco', 130, 'Mexican', true),
    (lets_go_live_cafe_id, 'Lebanese Paneer / Chicken Taco', 'Lebanese paneer or chicken taco', 130, 'Mexican', true),
    (lets_go_live_cafe_id, 'Chili Garlic Paneer / Chicken Taco', 'Chili garlic paneer or chicken taco', 130, 'Mexican', true),
    (lets_go_live_cafe_id, 'Paneer Tikka / Chicken Tikka Taco', 'Paneer tikka or chicken tikka taco', 130, 'Mexican', true),
    (lets_go_live_cafe_id, 'Mexican / Falafel Patty Taco', 'Mexican or falafel patty taco', 130, 'Mexican', true),
    (lets_go_live_cafe_id, 'Enchiladas - Paneer / Chicken', 'Paneer or chicken enchiladas', 150, 'Mexican', true);

    -- ========================================
    -- EGGS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (lets_go_live_cafe_id, 'Half / Full Fry', 'Half or full fried egg', 65, 'Eggs', true),
    (lets_go_live_cafe_id, 'Plain / Masala Omlette', 'Plain or masala omlette', 65, 'Eggs', true),
    (lets_go_live_cafe_id, 'French Toast / Chocolate FT', 'French toast or chocolate french toast', 80, 'Eggs', true),
    (lets_go_live_cafe_id, 'Masala Egg French Toast', 'Masala egg french toast', 80, 'Eggs', true),
    (lets_go_live_cafe_id, 'Scrambled Egg / Italian Omlette', 'Scrambled egg or Italian omlette', 80, 'Eggs', true),
    (lets_go_live_cafe_id, 'Egg Bhurji', 'Spicy egg bhurji', 80, 'Eggs', true),
    (lets_go_live_cafe_id, 'Cheese Omlette / Chicken Omlette', 'Cheese or chicken omlette', 100, 'Eggs', true),
    (lets_go_live_cafe_id, 'Peri Peri Chicken Omlette', 'Spicy peri peri chicken omlette', 120, 'Eggs', true),
    (lets_go_live_cafe_id, 'Chicken Cheese Omlette', 'Chicken cheese omlette', 120, 'Eggs', true),
    (lets_go_live_cafe_id, 'BBQ Chicken Omlette', 'BBQ chicken omlette', 120, 'Eggs', true),
    (lets_go_live_cafe_id, 'Extra Toast / Extra Egg', 'Extra toast or extra egg', 5, 'Eggs', true);

    -- ========================================
    -- WRAP WITH CHEESE
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (lets_go_live_cafe_id, 'Aloo Tikki Wrap / Egg Wrap', 'Aloo tikki or egg wrap', 80, 'Wrap with Cheese', true),
    (lets_go_live_cafe_id, 'Veggie Wrap / Aloo Achari Wrap', 'Veggie or aloo achari wrap', 90, 'Wrap with Cheese', true),
    (lets_go_live_cafe_id, 'Mexican Patty / Falafel Patty Wrap', 'Mexican patty or falafel patty wrap', 90, 'Wrap with Cheese', true),
    (lets_go_live_cafe_id, 'Peri Peri - Egg Wrap', 'Peri peri egg wrap', 90, 'Wrap with Cheese', true),
    (lets_go_live_cafe_id, 'Paneer Tikka / Chicken Tikka Wrap', 'Paneer tikka or chicken tikka wrap', 105, 'Wrap with Cheese', true),
    (lets_go_live_cafe_id, 'Lebanese - Chicken / Paneer Wrap', 'Lebanese chicken or paneer wrap', 105, 'Wrap with Cheese', true),
    (lets_go_live_cafe_id, 'BBQ Paneer / Chicken Wrap', 'BBQ paneer or chicken wrap', 105, 'Wrap with Cheese', true),
    (lets_go_live_cafe_id, 'Chili Garlic - Szechwan Paneer / Chicken', 'Chili garlic or szechwan paneer/chicken wrap', 105, 'Wrap with Cheese', true),
    (lets_go_live_cafe_id, 'Mexican Paneer / Chicken Wrap', 'Mexican paneer or chicken wrap', 105, 'Wrap with Cheese', true),
    (lets_go_live_cafe_id, 'Spicy Paneer / Chicken Wrap', 'Spicy paneer or chicken wrap', 105, 'Wrap with Cheese', true),
    (lets_go_live_cafe_id, 'Chicken Sheekh Kabab Wrap', 'Chicken sheekh kabab wrap', 105, 'Wrap with Cheese', true),
    (lets_go_live_cafe_id, 'Malai Chicken / Keema Wrap', 'Malai chicken or keema wrap', 120, 'Wrap with Cheese', true),
    (lets_go_live_cafe_id, 'Butter Chicken / Grilled Chicken Wrap', 'Butter chicken or grilled chicken wrap', 120, 'Wrap with Cheese', true),
    (lets_go_live_cafe_id, 'Double Egg Chicken - Sheekh / Tikka Chicken / Paneer - Calzone', 'Double egg chicken sheekh, tikka chicken, or paneer calzone', 120, 'Wrap with Cheese', true),
    (lets_go_live_cafe_id, 'Chicken Shawarma With Fries & Veggies', 'Chicken shawarma with fries and vegetables', 120, 'Wrap with Cheese', true),
    (lets_go_live_cafe_id, 'Chicken Chapli Kabab Wrap', 'Chicken chapli kabab wrap', 120, 'Wrap with Cheese', true),
    (lets_go_live_cafe_id, 'Laccha Paneer / Chicken Wrap', 'Laccha paneer or chicken wrap', 120, 'Wrap with Cheese', true),
    (lets_go_live_cafe_id, 'Whole Wheat Wrap / Extra Egg', 'Whole wheat wrap or extra egg', 20, 'Wrap with Cheese', true);

    -- ========================================
    -- BEVERAGES
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (lets_go_live_cafe_id, 'Lemonade / Iced Tea', 'Fresh lemonade or iced tea', 40, 'Beverages', true),
    (lets_go_live_cafe_id, 'Fresh Lime Soda / Masala Nimbu Soda', 'Fresh lime soda or masala nimbu soda', 50, 'Beverages', true),
    (lets_go_live_cafe_id, 'Cold Coffee / Hazelnut Cold Coffee', 'Classic cold coffee or hazelnut cold coffee', 60, 'Beverages', true),
    (lets_go_live_cafe_id, 'Mojito', 'Refreshing mojito', 60, 'Beverages', true),
    (lets_go_live_cafe_id, 'Mango / Strawberry', 'Mango or strawberry shake', 70, 'Beverages', true),
    (lets_go_live_cafe_id, 'Blueberry / Verry Berry Shake', 'Blueberry or very berry shake', 70, 'Beverages', true),
    (lets_go_live_cafe_id, 'Black Currant Shake', 'Black currant shake', 70, 'Beverages', true),
    (lets_go_live_cafe_id, 'Oreo / Chocolate / Brownie Shake', 'Oreo, chocolate, or brownie shake', 80, 'Beverages', true),
    (lets_go_live_cafe_id, 'Chocolate Hazelnut', 'Chocolate hazelnut shake', 80, 'Beverages', true),
    (lets_go_live_cafe_id, 'Pineapple Coconut Punch / Fruit Punch', 'Pineapple coconut punch or fruit punch', 80, 'Beverages', true),
    (lets_go_live_cafe_id, 'Frappe - Coffee / Chocolate', 'Coffee or chocolate frappe', 90, 'Beverages', true);

    -- ========================================
    -- BROWNIES / PANCAKES
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (lets_go_live_cafe_id, 'Hot Chocolate', 'Rich hot chocolate', 80, 'Brownies/Pancakes', true),
    (lets_go_live_cafe_id, 'Brownie / with Ice-cream', 'Classic brownie or with ice cream', 80, 'Brownies/Pancakes', true),
    (lets_go_live_cafe_id, 'Nutella Hot Chocolate Brownie', 'Nutella hot chocolate brownie', 120, 'Brownies/Pancakes', true),
    (lets_go_live_cafe_id, 'Vanilla Pancake / Caramel Pancake', 'Vanilla or caramel pancake', 120, 'Brownies/Pancakes', true),
    (lets_go_live_cafe_id, 'Chocolate Choco Chip Pancake', 'Chocolate choco chip pancake', 140, 'Brownies/Pancakes', true),
    (lets_go_live_cafe_id, 'Nutella Pancake', 'Nutella pancake', 160, 'Brownies/Pancakes', true);

    RAISE NOTICE 'Let''s Go Live cafe successfully added/updated with % menu items', (SELECT COUNT(*) FROM public.menu_items WHERE cafe_id = lets_go_live_cafe_id);
END $$;
