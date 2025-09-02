-- Add DEV SWEETS & SNACKS cafe with comprehensive menu from the provided images
-- Run this script directly in your Supabase SQL Editor

DO $$
DECLARE
    dev_sweets_cafe_id UUID;
BEGIN
    -- Check if Dev Sweets cafe exists, if not create it
    SELECT id INTO dev_sweets_cafe_id FROM public.cafes WHERE name = 'Dev Sweets & Snacks';
    
    -- If cafe doesn't exist, create it
    IF dev_sweets_cafe_id IS NULL THEN
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
            'Dev Sweets & Snacks',
            'Sweets & Multi-Cuisine',
            'A delightful destination for sweets, snacks, and beverages. From traditional Indian sweets to modern shakes, sandwiches to hot beverages - we bring you the perfect blend of taste and comfort. Specializing in fresh sweets, innovative shakes, and delicious quick bites!',
            'Ground Floor, GHS',
            '+91-9358387779',
            '11:00 AM - 11:00 PM',
            true,
            NOW(),
            NOW()
        );
        
        -- Get the newly created cafe ID
        SELECT id INTO dev_sweets_cafe_id FROM public.cafes WHERE name = 'Dev Sweets & Snacks';
    END IF;
    
    -- Clear existing menu items for Dev Sweets
    DELETE FROM public.menu_items WHERE cafe_id = dev_sweets_cafe_id;
    
    -- ========================================
    -- SANDWICH
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (dev_sweets_cafe_id, 'Cheese Chilli Corn Sandwich', 'Cheese and spicy corn sandwich', 95, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Crispy Masala Cheese Sandwich', 'Crispy masala cheese sandwich', 95, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Triple Layer Cheese Sandwich', 'Triple layer cheese sandwich', 105, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Peri-Peri Paneer Sandwich', 'Spicy peri-peri paneer sandwich', 105, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Mushroom Cheese Sandwich', 'Mushroom and cheese sandwich', 95, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Peanut Butter Sandwich', 'Classic peanut butter sandwich', 85, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Cheese Overloaded Sandwich', 'Extra cheese loaded sandwich', 100, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Chilli Paneer Sandwich', 'Spicy chilli paneer sandwich', 110, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Classic Veg Sandwich', 'Classic vegetable sandwich', 70, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Corn Chat Sandwich', 'Corn chat style sandwich', 85, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Vegetable Plan Sandwich', 'Simple vegetable sandwich', 55, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Jaipur Special Cheese Sandwich', 'Jaipur special cheese sandwich', 120, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Veg Sandwich', 'Basic vegetable sandwich', 60, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Club Sandwich', 'Classic club sandwich', 90, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Club Sandwich With Cheese', 'Club sandwich with extra cheese', 100, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Tandoori Paneer Sandwich', 'Tandoori style paneer sandwich', 85, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Chocolawa Sandwich', 'Chocolate lava sandwich', 80, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Aloo Sandwich', 'Potato sandwich', 60, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Mexican Sandwich', 'Mexican style sandwich', 75, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Cheese Tomato Sandwich', 'Cheese and tomato sandwich', 85, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Spicy Red Chill Sandwich', 'Spicy red chilli sandwich', 75, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Aloo Cheese Sandwich', 'Potato and cheese sandwich', 85, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Tandoori Cheese Sandwich', 'Tandoori style cheese sandwich', 95, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Garlic Cheese Sandwich', 'Garlic flavored cheese sandwich', 85, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Mumbai Bhurji Sandwich', 'Mumbai style bhurji sandwich', 80, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Cheese Corn Sandwich', 'Cheese and corn sandwich', 95, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Cheese Sandwich', 'Basic cheese sandwich', 85, 'Sandwich', true),
    (dev_sweets_cafe_id, 'Mexican Cheese Sandwich', 'Mexican style cheese sandwich', 90, 'Sandwich', true);

    -- ========================================
    -- SUBS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (dev_sweets_cafe_id, 'Chatpata Chana', 'Spicy and tangy chana sub', 100, 'Subs', true),
    (dev_sweets_cafe_id, 'Mexican Patty', 'Mexican style patty sub', 110, 'Subs', true),
    (dev_sweets_cafe_id, 'Hara Bhara Kabab', 'Green vegetable kabab sub', 110, 'Subs', true),
    (dev_sweets_cafe_id, 'Veg Shammi', 'Vegetable shammi kabab sub', 110, 'Subs', true),
    (dev_sweets_cafe_id, 'Aloo Patty', 'Potato patty sub', 100, 'Subs', true),
    (dev_sweets_cafe_id, 'Paneer Tikka', 'Paneer tikka sub', 110, 'Subs', true),
    (dev_sweets_cafe_id, 'Veggie Patty', 'Vegetable patty sub', 100, 'Subs', true),
    (dev_sweets_cafe_id, 'Veggie Delight', 'Mixed vegetable delight sub', 100, 'Subs', true);

    -- ========================================
    -- BURGER
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (dev_sweets_cafe_id, 'Veg Burger', 'Basic vegetable burger', 65, 'Burger', true),
    (dev_sweets_cafe_id, 'Cheese Burger', 'Cheese burger', 75, 'Burger', true),
    (dev_sweets_cafe_id, 'Paneer Burger', 'Paneer burger', 80, 'Burger', true),
    (dev_sweets_cafe_id, 'Achari Aloo Burger', 'Pickle flavored potato burger', 70, 'Burger', true),
    (dev_sweets_cafe_id, 'Paneer Cheese Burger', 'Paneer and cheese burger', 85, 'Burger', true),
    (dev_sweets_cafe_id, 'Spicy Paneer Burger', 'Spicy paneer burger', 80, 'Burger', true),
    (dev_sweets_cafe_id, 'Maxican Burger', 'Mexican style burger', 70, 'Burger', true),
    (dev_sweets_cafe_id, 'Maxican Cheese Burger', 'Mexican style cheese burger', 75, 'Burger', true);

    -- ========================================
    -- HOT DOGS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (dev_sweets_cafe_id, 'Veg Hot Dog', 'Vegetable hot dog', 60, 'Hot Dogs', true),
    (dev_sweets_cafe_id, 'Cheese Hot Dog', 'Cheese hot dog', 70, 'Hot Dogs', true),
    (dev_sweets_cafe_id, 'Paneer Hot Dog', 'Paneer hot dog', 80, 'Hot Dogs', true);

    -- ========================================
    -- NUGGETS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (dev_sweets_cafe_id, 'Cheese Corn Nuggets', 'Cheese and corn nuggets', 100, 'Nuggets', true),
    (dev_sweets_cafe_id, 'Veg Nuggets', 'Vegetable nuggets', 90, 'Nuggets', true),
    (dev_sweets_cafe_id, 'Cheese Nachos', 'Cheese nachos', 100, 'Nuggets', true);

    -- ========================================
    -- SMOOTHIE
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (dev_sweets_cafe_id, 'Banana Smoothie', 'Fresh banana smoothie', 80, 'Smoothie', true),
    (dev_sweets_cafe_id, 'Mango Smoothie', 'Fresh mango smoothie', 80, 'Smoothie', true),
    (dev_sweets_cafe_id, 'Strawberry Smoothie', 'Fresh strawberry smoothie', 80, 'Smoothie', true),
    (dev_sweets_cafe_id, 'Pineapple Smoothie', 'Fresh pineapple smoothie', 80, 'Smoothie', true),
    (dev_sweets_cafe_id, 'Chocolate Smoothie', 'Rich chocolate smoothie', 90, 'Smoothie', true);

    -- ========================================
    -- CRISPY FRIES SNAKES
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (dev_sweets_cafe_id, 'French Fries', 'Classic french fries', 80, 'Crispy Fries Snakes', true),
    (dev_sweets_cafe_id, 'Peri-Peri French Fries', 'Spicy peri-peri french fries', 90, 'Crispy Fries Snakes', true),
    (dev_sweets_cafe_id, 'Potato Veg Fries', 'Potato vegetable fries', 80, 'Crispy Fries Snakes', true),
    (dev_sweets_cafe_id, 'Cheese Corn Balls', 'Cheese and corn balls', 90, 'Crispy Fries Snakes', true);

    -- ========================================
    -- MAGGI
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (dev_sweets_cafe_id, 'Veg Maggi', 'Vegetable maggi', 70, 'Maggi', true),
    (dev_sweets_cafe_id, 'Masala Maggi', 'Spicy masala maggi', 60, 'Maggi', true),
    (dev_sweets_cafe_id, 'Tandoori Maggi', 'Tandoori style maggi', 80, 'Maggi', true),
    (dev_sweets_cafe_id, 'Cheese Maggi', 'Cheese maggi', 85, 'Maggi', true),
    (dev_sweets_cafe_id, 'Creamy Maggi', 'Creamy maggi', 90, 'Maggi', true);

    -- ========================================
    -- SHAKES - SMALL SIZE
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (dev_sweets_cafe_id, 'Oreo Kit-Kat Shake (Small)', 'Oreo and Kit-Kat shake - small size', 100, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Oreo Brownie Shake (Small)', 'Oreo and brownie shake - small size', 100, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Hazelnut Shake (Small)', 'Hazelnut shake - small size', 110, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Snickers Shake (Small)', 'Snickers shake - small size', 100, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Kit Kat Brownie (Small)', 'Kit Kat and brownie shake - small size', 100, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Cold Chocolate (Small)', 'Cold chocolate shake - small size', 80, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Chocolate Shake (Small)', 'Chocolate shake - small size', 85, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Nutella Shake (Small)', 'Nutella shake - small size', 90, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Strawberry Bubble Gum Shake (Small)', 'Strawberry bubble gum shake - small size', 90, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Caramel Dark Shake (Small)', 'Caramel dark shake - small size', 90, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Black Current (Small)', 'Black current shake - small size', 90, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Banana Peanuts (Small)', 'Banana and peanuts shake - small size', 90, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Brownie Shake (Small)', 'Brownie shake - small size', 100, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Peanut Butter Shake (Small)', 'Peanut butter shake - small size', 80, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Oreo Shake (Small)', 'Oreo shake - small size', 90, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Kit-Kat Shake (Small)', 'Kit-Kat shake - small size', 90, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Mango Shake (Small)', 'Fresh mango shake - small size', 70, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Litchi Shake (Small)', 'Fresh litchi shake - small size', 70, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Vanilla Shake (Small)', 'Vanilla shake - small size', 70, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Butter Scotch Shake (Small)', 'Butter scotch shake - small size', 80, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Rose Shake (Small)', 'Rose flavored shake - small size', 60, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Badam Thandai (Small)', 'Almond thandai shake - small size', 70, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Blueberry Shake (Small)', 'Blueberry shake - small size', 75, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Blackberry Shake (Small)', 'Blackberry shake - small size', 75, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Banana Shake (Small)', 'Fresh banana shake - small size', 75, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Strawberry Shake (Small)', 'Fresh strawberry shake - small size', 70, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Mix Fruit Shake (Small)', 'Mixed fruit shake - small size', 75, 'Shakes - Small', true),
    (dev_sweets_cafe_id, 'Bournvita Shake (Small)', 'Bournvita shake - small size', 80, 'Shakes - Small', true);

    -- ========================================
    -- SHAKES - LARGE SIZE
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (dev_sweets_cafe_id, 'Oreo Kit-Kat Shake (Large)', 'Oreo and Kit-Kat shake - large size', 120, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Oreo Brownie Shake (Large)', 'Oreo and brownie shake - large size', 120, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Hazelnut Shake (Large)', 'Hazelnut shake - large size', 120, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Snickers Shake (Large)', 'Snickers shake - large size', 120, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Kit Kat Brownie (Large)', 'Kit Kat and brownie shake - large size', 120, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Cold Chocolate (Large)', 'Cold chocolate shake - large size', 100, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Chocolate Shake (Large)', 'Chocolate shake - large size', 100, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Nutella Shake (Large)', 'Nutella shake - large size', 110, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Strawberry Bubble Gum Shake (Large)', 'Strawberry bubble gum shake - large size', 110, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Caramel Dark Shake (Large)', 'Caramel dark shake - large size', 110, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Black Current (Large)', 'Black current shake - large size', 110, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Banana Peanuts (Large)', 'Banana and peanuts shake - large size', 110, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Brownie Shake (Large)', 'Brownie shake - large size', 120, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Peanut Butter Shake (Large)', 'Peanut butter shake - large size', 100, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Oreo Shake (Large)', 'Oreo shake - large size', 110, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Kit-Kat Shake (Large)', 'Kit-Kat shake - large size', 110, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Mango Shake (Large)', 'Fresh mango shake - large size', 90, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Litchi Shake (Large)', 'Fresh litchi shake - large size', 90, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Vanilla Shake (Large)', 'Vanilla shake - large size', 90, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Butter Scotch Shake (Large)', 'Butter scotch shake - large size', 100, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Rose Shake (Large)', 'Rose flavored shake - large size', 80, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Badam Thandai (Large)', 'Almond thandai shake - large size', 90, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Blueberry Shake (Large)', 'Blueberry shake - large size', 100, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Blackberry Shake (Large)', 'Blackberry shake - large size', 100, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Banana Shake (Large)', 'Fresh banana shake - large size', 95, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Strawberry Shake (Large)', 'Fresh strawberry shake - large size', 90, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Mix Fruit Shake (Large)', 'Mixed fruit shake - large size', 90, 'Shakes - Large', true),
    (dev_sweets_cafe_id, 'Bournvita Shake (Large)', 'Bournvita shake - large size', 100, 'Shakes - Large', true);

    -- ========================================
    -- COLD COFFEE - SMALL SIZE
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (dev_sweets_cafe_id, 'Brownie Gold Coffee (Small)', 'Brownie gold cold coffee - small size', 100, 'Cold Coffee - Small', true),
    (dev_sweets_cafe_id, 'Milk Cold Coffee (Small)', 'Milk cold coffee - small size', 60, 'Cold Coffee - Small', true),
    (dev_sweets_cafe_id, 'Ice-Cream Cold Coffee (Small)', 'Ice cream cold coffee - small size', 90, 'Cold Coffee - Small', true),
    (dev_sweets_cafe_id, 'Crunchy Oreo Cold Coffee (Small)', 'Crunchy oreo cold coffee - small size', 90, 'Cold Coffee - Small', true),
    (dev_sweets_cafe_id, 'Caramel Cold Coffee (Small)', 'Caramel cold coffee - small size', 75, 'Cold Coffee - Small', true);

    -- ========================================
    -- COLD COFFEE - LARGE SIZE
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (dev_sweets_cafe_id, 'Brownie Gold Coffee (Large)', 'Brownie gold cold coffee - large size', 120, 'Cold Coffee - Large', true),
    (dev_sweets_cafe_id, 'Milk Cold Coffee (Large)', 'Milk cold coffee - large size', 80, 'Cold Coffee - Large', true),
    (dev_sweets_cafe_id, 'Ice-Cream Cold Coffee (Large)', 'Ice cream cold coffee - large size', 110, 'Cold Coffee - Large', true),
    (dev_sweets_cafe_id, 'Crunchy Oreo Cold Coffee (Large)', 'Crunchy oreo cold coffee - large size', 110, 'Cold Coffee - Large', true),
    (dev_sweets_cafe_id, 'Caramel Cold Coffee (Large)', 'Caramel cold coffee - large size', 90, 'Cold Coffee - Large', true);

    -- ========================================
    -- HOT TEA & COFFEE
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (dev_sweets_cafe_id, 'Hot Tea', 'Classic hot tea', 20, 'Hot Tea & Coffee', true),
    (dev_sweets_cafe_id, 'Hot Coffee', 'Classic hot coffee', 25, 'Hot Tea & Coffee', true),
    (dev_sweets_cafe_id, 'Hot Chocolate', 'Rich hot chocolate', 60, 'Hot Tea & Coffee', true),
    (dev_sweets_cafe_id, 'Hot Nutella', 'Hot Nutella drink', 80, 'Hot Tea & Coffee', true),
    (dev_sweets_cafe_id, 'Hot Milk', 'Warm milk', 50, 'Hot Tea & Coffee', true),
    (dev_sweets_cafe_id, 'Cappuccino', 'Classic cappuccino', 30, 'Hot Tea & Coffee', true);

    -- ========================================
    -- SODA - SMALL SIZE
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (dev_sweets_cafe_id, 'Fresh Lemon Soda (Small)', 'Fresh lemon soda - small size', 50, 'Soda - Small', true),
    (dev_sweets_cafe_id, 'Strawberry Soda (Small)', 'Strawberry soda - small size', 60, 'Soda - Small', true),
    (dev_sweets_cafe_id, 'Green Apple Soda (Small)', 'Green apple soda - small size', 60, 'Soda - Small', true),
    (dev_sweets_cafe_id, 'Blue Lagoon Mocktail Soda (Small)', 'Blue lagoon mocktail soda - small size', 60, 'Soda - Small', true);

    -- ========================================
    -- SODA - LARGE SIZE
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (dev_sweets_cafe_id, 'Fresh Lemon Soda (Large)', 'Fresh lemon soda - large size', 60, 'Soda - Large', true),
    (dev_sweets_cafe_id, 'Strawberry Soda (Large)', 'Strawberry soda - large size', 80, 'Soda - Large', true),
    (dev_sweets_cafe_id, 'Green Apple Soda (Large)', 'Green apple soda - large size', 80, 'Soda - Large', true),
    (dev_sweets_cafe_id, 'Blue Lagoon Mocktail Soda (Large)', 'Blue lagoon mocktail soda - large size', 80, 'Soda - Large', true);

    -- ========================================
    -- SLUSH - SMALL SIZE
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (dev_sweets_cafe_id, 'Blue Slush (Small)', 'Blue slush - small size', 60, 'Slush - Small', true),
    (dev_sweets_cafe_id, 'Strawberry Slush (Small)', 'Strawberry slush - small size', 70, 'Slush - Small', true),
    (dev_sweets_cafe_id, 'Green Apple Slush (Small)', 'Green apple slush - small size', 75, 'Slush - Small', true),
    (dev_sweets_cafe_id, 'Orange Slush (Small)', 'Orange slush - small size', 75, 'Slush - Small', true);

    -- ========================================
    -- SLUSH - LARGE SIZE
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (dev_sweets_cafe_id, 'Blue Slush (Large)', 'Blue slush - large size', 80, 'Slush - Large', true),
    (dev_sweets_cafe_id, 'Strawberry Slush (Large)', 'Strawberry slush - large size', 90, 'Slush - Large', true),
    (dev_sweets_cafe_id, 'Green Apple Slush (Large)', 'Green apple slush - large size', 90, 'Slush - Large', true),
    (dev_sweets_cafe_id, 'Orange Slush (Large)', 'Orange slush - large size', 90, 'Slush - Large', true);

    -- ========================================
    -- SUNDAE
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (dev_sweets_cafe_id, 'Tutti Frutti Sundae', 'Tutti frutti ice cream sundae', 90, 'Sundae', true),
    (dev_sweets_cafe_id, 'Chocolate Fassion Sundae', 'Chocolate passion sundae', 110, 'Sundae', true),
    (dev_sweets_cafe_id, 'Vanila Fassion Sundae', 'Vanilla passion sundae', 100, 'Sundae', true),
    (dev_sweets_cafe_id, 'Butter Scotch Fassion', 'Butter scotch passion sundae', 105, 'Sundae', true),
    (dev_sweets_cafe_id, 'Banana Fudge Sundae', 'Banana fudge sundae', 90, 'Sundae', true),
    (dev_sweets_cafe_id, 'Brownie Fudge Sundae', 'Brownie fudge sundae', 110, 'Sundae', true),
    (dev_sweets_cafe_id, 'Brownie With Ice Cream', 'Brownie with ice cream', 100, 'Sundae', true),
    (dev_sweets_cafe_id, 'Choco Holo Sundae', 'Chocolate holo sundae', 105, 'Sundae', true),
    (dev_sweets_cafe_id, 'Black Forest Sundae', 'Black forest sundae', 100, 'Sundae', true),
    (dev_sweets_cafe_id, 'Sizzling Brownie', 'Sizzling brownie dessert', 115, 'Sundae', true);

    -- ========================================
    -- ICE TEA - SMALL SIZE
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (dev_sweets_cafe_id, 'Water Melon Ice Tea (Small)', 'Watermelon ice tea - small size', 60, 'Ice Tea - Small', true),
    (dev_sweets_cafe_id, 'Orange Ice Tea (Small)', 'Orange ice tea - small size', 60, 'Ice Tea - Small', true),
    (dev_sweets_cafe_id, 'Lemon Ice Tea (Small)', 'Lemon ice tea - small size', 50, 'Ice Tea - Small', true),
    (dev_sweets_cafe_id, 'Fruit Beer Ice Tea (Small)', 'Fruit beer ice tea - small size', 50, 'Ice Tea - Small', true),
    (dev_sweets_cafe_id, 'Green Apple Ice Tea (Small)', 'Green apple ice tea - small size', 60, 'Ice Tea - Small', true),
    (dev_sweets_cafe_id, 'Strawberry Ice Tea (Small)', 'Strawberry ice tea - small size', 60, 'Ice Tea - Small', true),
    (dev_sweets_cafe_id, 'Peach Ice Tea (Small)', 'Peach ice tea - small size', 60, 'Ice Tea - Small', true);

    -- ========================================
    -- ICE TEA - LARGE SIZE
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (dev_sweets_cafe_id, 'Water Melon Ice Tea (Large)', 'Watermelon ice tea - large size', 80, 'Ice Tea - Large', true),
    (dev_sweets_cafe_id, 'Orange Ice Tea (Large)', 'Orange ice tea - large size', 80, 'Ice Tea - Small', true),
    (dev_sweets_cafe_id, 'Lemon Ice Tea (Large)', 'Lemon ice tea - large size', 70, 'Ice Tea - Large', true),
    (dev_sweets_cafe_id, 'Fruit Beer Ice Tea (Large)', 'Fruit beer ice tea - large size', 70, 'Ice Tea - Large', true),
    (dev_sweets_cafe_id, 'Green Apple Ice Tea (Large)', 'Green apple ice tea - large size', 80, 'Ice Tea - Large', true),
    (dev_sweets_cafe_id, 'Strawberry Ice Tea (Large)', 'Strawberry ice tea - large size', 80, 'Ice Tea - Large', true),
    (dev_sweets_cafe_id, 'Peach Ice Tea (Large)', 'Peach ice tea - large size', 80, 'Ice Tea - Large', true);

    -- ========================================
    -- SPECIAL BEVERAGES
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (dev_sweets_cafe_id, 'Nimbu Pani (Small)', 'Lemon water - small size', 20, 'Special Beverages', true),
    (dev_sweets_cafe_id, 'Nimbu Pani (Medium)', 'Lemon water - medium size', 30, 'Special Beverages', true),
    (dev_sweets_cafe_id, 'Nimbu Pani (Large)', 'Lemon water - large size', 40, 'Special Beverages', true),
    (dev_sweets_cafe_id, 'Tang (Small)', 'Tang drink - small size', 30, 'Special Beverages', true),
    (dev_sweets_cafe_id, 'Tang (Large)', 'Tang drink - large size', 40, 'Special Beverages', true);

    -- ========================================
    -- SWEETS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (dev_sweets_cafe_id, 'Gulab Jamun', 'Traditional gulab jamun', 25, 'Sweets', true),
    (dev_sweets_cafe_id, 'Rasgulla', 'Traditional rasgulla', 20, 'Sweets', true),
    (dev_sweets_cafe_id, 'Kesar Bati', 'Saffron flavored sweet', 20, 'Sweets', true),
    (dev_sweets_cafe_id, 'Other Sweets on Order', 'Custom sweets available on order', 0, 'Sweets', true);

    RAISE NOTICE 'Dev Sweets & Snacks cafe successfully added/updated with % menu items', (SELECT COUNT(*) FROM public.menu_items WHERE cafe_id = dev_sweets_cafe_id);
END $$;
