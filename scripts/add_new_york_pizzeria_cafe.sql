-- Add New York Pizzeria as an off-campus cafe
-- Run this script directly in your Supabase SQL Editor

DO $$
DECLARE
    new_york_pizzeria_cafe_id UUID;
BEGIN
    -- Check if New York Pizzeria cafe exists, if not create it
    SELECT id INTO new_york_pizzeria_cafe_id FROM public.cafes WHERE name = 'New York Pizzeria' OR slug = 'newyorkpizzeria';
    
    -- If cafe doesn't exist, create it
    IF new_york_pizzeria_cafe_id IS NULL THEN
        INSERT INTO public.cafes (
            id,
            name,
            slug,
            type,
            description,
            location,
            phone,
            hours,
            image_url,
            accepting_orders,
            priority,
            location_scope,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            'New York Pizzeria',
            'newyorkpizzeria',
            'Pizzeria',
            'Original New York Style Pizza starting at ₹69. Experience authentic New York style pizzas, creamy pasta, delicious wraps, refreshing shakes, and much more! From classic margherita to loaded veggie pizzas, we bring you the finest Italian-American flavors.',
            'Manipal University Road, Bagru, Jaipur Rajasthan',
            '9888044288',
            '10:00 AM - 4:00 AM',
            'https://ik.imagekit.io/foodclub/Cafe/New%20York%20Pizzeria/banner.jpg',
            true,
            15,
            'off_campus',
            true,
            NOW(),
            NOW()
        );
        
        -- Get the newly created cafe ID
        SELECT id INTO new_york_pizzeria_cafe_id FROM public.cafes WHERE slug = 'newyorkpizzeria';
    ELSE
        -- Update existing cafe
        UPDATE public.cafes
        SET
            name = 'New York Pizzeria',
            slug = 'newyorkpizzeria',
            type = 'Pizzeria',
            description = 'Original New York Style Pizza starting at ₹69. Experience authentic New York style pizzas, creamy pasta, delicious wraps, refreshing shakes, and much more! From classic margherita to loaded veggie pizzas, we bring you the finest Italian-American flavors.',
            location = 'Manipal University Road, Bagru, Jaipur Rajasthan',
            phone = '9888044288',
            hours = '10:00 AM - 4:00 AM',
            image_url = 'https://ik.imagekit.io/foodclub/Cafe/New%20York%20Pizzeria/banner.jpg',
            accepting_orders = true,
            priority = 15,
            location_scope = 'off_campus',
            is_active = true,
            updated_at = NOW()
        WHERE id = new_york_pizzeria_cafe_id;
    END IF;
    
    -- Clear existing menu items for New York Pizzeria
    DELETE FROM public.menu_items WHERE cafe_id = new_york_pizzeria_cafe_id;
    
    -- ========================================
    -- VEG. PIZZAS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (new_york_pizzeria_cafe_id, 'New York Style Pizza (Reg)', 'Fresh Pizza Sauce, 100% Mozzarella Cheese - Regular (7")', 100, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'New York Style Pizza (Med)', 'Fresh Pizza Sauce, 100% Mozzarella Cheese - Medium (10")', 200, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'New York Style Pizza (X. Large)', 'Fresh Pizza Sauce, 100% Mozzarella Cheese - X. Large (18")', 600, 'Veg. Pizzas', true),
    
    (new_york_pizzeria_cafe_id, 'Jain Special (Reg)', 'Our Divine Version of Cheesy Yummy Pizza - Green Capsicum, Paneer, Fresh Pizza Sauce, 100% Mozzarella Cheese - Regular (7")', 149, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Jain Special (Med)', 'Our Divine Version of Cheesy Yummy Pizza - Green Capsicum, Paneer, Fresh Pizza Sauce, 100% Mozzarella Cheese - Medium (10")', 289, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Jain Special (X. Large)', 'Our Divine Version of Cheesy Yummy Pizza - Green Capsicum, Paneer, Fresh Pizza Sauce, 100% Mozzarella Cheese - X. Large (18")', 650, 'Veg. Pizzas', true),
    
    (new_york_pizzeria_cafe_id, 'Classic Crunch (Reg)', 'Our Divine Version of Cheesy Yummy Pizza - Green Capsicum, Onion, Fresh Pizza Sauce, 100% Mozzarella Cheese - Regular (7")', 129, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Classic Crunch (Med)', 'Our Divine Version of Cheesy Yummy Pizza - Green Capsicum, Onion, Fresh Pizza Sauce, 100% Mozzarella Cheese - Medium (10")', 249, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Classic Crunch (X. Large)', 'Our Divine Version of Cheesy Yummy Pizza - Green Capsicum, Onion, Fresh Pizza Sauce, 100% Mozzarella Cheese - X. Large (18")', 629, 'Veg. Pizzas', true),
    
    (new_york_pizzeria_cafe_id, 'Loaded Corn Cheese (Reg)', 'Our Divine Version of Cheesy Yummy Pizza - Corn & Fresh Pizza Sauce, 100% Mozzarella Cheese - Regular (7")', 160, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Loaded Corn Cheese (Med)', 'Our Divine Version of Cheesy Yummy Pizza - Corn & Fresh Pizza Sauce, 100% Mozzarella Cheese - Medium (10")', 290, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Loaded Corn Cheese (X. Large)', 'Our Divine Version of Cheesy Yummy Pizza - Corn & Fresh Pizza Sauce, 100% Mozzarella Cheese - X. Large (18")', 655, 'Veg. Pizzas', true),
    
    (new_york_pizzeria_cafe_id, 'Veg Lovers (Reg)', 'Onion, Green Capsicum, Mushroom, Tomato, Fresh Pizza Sauce & 100% Mozzarella Cheese - Regular (7")', 160, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Veg Lovers (Med)', 'Onion, Green Capsicum, Mushroom, Tomato, Fresh Pizza Sauce & 100% Mozzarella Cheese - Medium (10")', 290, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Veg Lovers (X. Large)', 'Onion, Green Capsicum, Mushroom, Tomato, Fresh Pizza Sauce & 100% Mozzarella Cheese - X. Large (18")', 655, 'Veg. Pizzas', true),
    
    (new_york_pizzeria_cafe_id, 'Mexican Italian Veg (Reg)', 'Onion, Tomato, Green Capsicum, Red Pepper, Jalapeno, Fresh Pizza Sauce & 100% Mozzarella Cheese - Regular (7")', 180, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Mexican Italian Veg (Med)', 'Onion, Tomato, Green Capsicum, Red Pepper, Jalapeno, Fresh Pizza Sauce & 100% Mozzarella Cheese - Medium (10")', 360, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Mexican Italian Veg (X. Large)', 'Onion, Tomato, Green Capsicum, Red Pepper, Jalapeno, Fresh Pizza Sauce & 100% Mozzarella Cheese - X. Large (18")', 705, 'Veg. Pizzas', true),
    
    (new_york_pizzeria_cafe_id, 'Hawaiian Fantasy (Reg)', 'If You Dream for a Pizza, This is a Dream Come True - Pineapple, Red Pepper, Onion & Olive Gherkins, Fresh Pizza Sauce & 100% Mozzarella Cheese - Regular (7")', 180, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Hawaiian Fantasy (Med)', 'If You Dream for a Pizza, This is a Dream Come True - Pineapple, Red Pepper, Onion & Olive Gherkins, Fresh Pizza Sauce & 100% Mozzarella Cheese - Medium (10")', 360, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Hawaiian Fantasy (X. Large)', 'If You Dream for a Pizza, This is a Dream Come True - Pineapple, Red Pepper, Onion & Olive Gherkins, Fresh Pizza Sauce & 100% Mozzarella Cheese - X. Large (18")', 705, 'Veg. Pizzas', true),
    
    (new_york_pizzeria_cafe_id, 'Deluxe Veggie (Reg)', 'Capsicum, Mushroom, Olives, Onion, Corn, Green Chillies, Fresh Pizza Sauce & 100% Mozzarella Cheese - Regular (7")', 180, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Deluxe Veggie (Med)', 'Capsicum, Mushroom, Olives, Onion, Corn, Green Chillies, Fresh Pizza Sauce & 100% Mozzarella Cheese - Medium (10")', 360, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Deluxe Veggie (X. Large)', 'Capsicum, Mushroom, Olives, Onion, Corn, Green Chillies, Fresh Pizza Sauce & 100% Mozzarella Cheese - X. Large (18")', 705, 'Veg. Pizzas', true),
    
    (new_york_pizzeria_cafe_id, 'Spicy Treat (Reg)', 'Let the Gossip Begin - Paneer Coated in Peri Peri Seasoning, Olives, Tomato, Capsicum, Red Pepper, Fresh Pizza Sauce & 100% Mozzarella Cheese - Regular (7")', 180, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Spicy Treat (Med)', 'Let the Gossip Begin - Paneer Coated in Peri Peri Seasoning, Olives, Tomato, Capsicum, Red Pepper, Fresh Pizza Sauce & 100% Mozzarella Cheese - Medium (10")', 360, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Spicy Treat (X. Large)', 'Let the Gossip Begin - Paneer Coated in Peri Peri Seasoning, Olives, Tomato, Capsicum, Red Pepper, Fresh Pizza Sauce & 100% Mozzarella Cheese - X. Large (18")', 705, 'Veg. Pizzas', true),
    
    (new_york_pizzeria_cafe_id, 'Makhani Paneer (Reg)', 'Paneer, Onion, Capsicum, Red Pepper, Fresh Makhani Sauce & 100% Mozzarella Cheese - Regular (7")', 190, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Makhani Paneer (Med)', 'Paneer, Onion, Capsicum, Red Pepper, Fresh Makhani Sauce & 100% Mozzarella Cheese - Medium (10")', 380, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Makhani Paneer (X. Large)', 'Paneer, Onion, Capsicum, Red Pepper, Fresh Makhani Sauce & 100% Mozzarella Cheese - X. Large (18")', 810, 'Veg. Pizzas', true),
    
    (new_york_pizzeria_cafe_id, 'Tikka Tikka (In Makhani Sauce) (Reg)', 'Let Your Taste Buds Go Wild - Green Chilli, Garlic, Onion, Capsicum, Tomato, Paneer, Fresh Pizza Sauce & 100% Mozzarella Cheese - Regular (7")', 190, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Tikka Tikka (In Makhani Sauce) (Med)', 'Let Your Taste Buds Go Wild - Green Chilli, Garlic, Onion, Capsicum, Tomato, Paneer, Fresh Pizza Sauce & 100% Mozzarella Cheese - Medium (10")', 380, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Tikka Tikka (In Makhani Sauce) (X. Large)', 'Let Your Taste Buds Go Wild - Green Chilli, Garlic, Onion, Capsicum, Tomato, Paneer, Fresh Pizza Sauce & 100% Mozzarella Cheese - X. Large (18")', 810, 'Veg. Pizzas', true),
    
    (new_york_pizzeria_cafe_id, 'BBQ Paneer (Reg)', 'Onion, Corn, Mushroom, BBQ Paneer, Tomato BBQ Sauce, Fresh Pizza Sauce & 100% Mozzarella Cheese - Regular (7")', 190, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'BBQ Paneer (Med)', 'Onion, Corn, Mushroom, BBQ Paneer, Tomato BBQ Sauce, Fresh Pizza Sauce & 100% Mozzarella Cheese - Medium (10")', 380, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'BBQ Paneer (X. Large)', 'Onion, Corn, Mushroom, BBQ Paneer, Tomato BBQ Sauce, Fresh Pizza Sauce & 100% Mozzarella Cheese - X. Large (18")', 810, 'Veg. Pizzas', true),
    
    (new_york_pizzeria_cafe_id, 'Peri Peri Paneer (Reg)', 'Red, Yellow and Green Capsicum, Onion, Jalapeno, Peri Peri Paneer, Fresh Pizza Sauce & 100% Mozzarella Cheese - Regular (7")', 190, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Peri Peri Paneer (Med)', 'Red, Yellow and Green Capsicum, Onion, Jalapeno, Peri Peri Paneer, Fresh Pizza Sauce & 100% Mozzarella Cheese - Medium (10")', 380, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Peri Peri Paneer (X. Large)', 'Red, Yellow and Green Capsicum, Onion, Jalapeno, Peri Peri Paneer, Fresh Pizza Sauce & 100% Mozzarella Cheese - X. Large (18")', 810, 'Veg. Pizzas', true),
    
    (new_york_pizzeria_cafe_id, 'Supreme Veg. (Reg)', 'Baby Corn, Green Capsicum, Tomato, Onion, Mushroom, Olives, Fresh Pizza Sauce & 100% Mozzarella Cheese - Regular (7")', 210, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Supreme Veg. (Med)', 'Baby Corn, Green Capsicum, Tomato, Onion, Mushroom, Olives, Fresh Pizza Sauce & 100% Mozzarella Cheese - Medium (10")', 390, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Supreme Veg. (X. Large)', 'Baby Corn, Green Capsicum, Tomato, Onion, Mushroom, Olives, Fresh Pizza Sauce & 100% Mozzarella Cheese - X. Large (18")', 815, 'Veg. Pizzas', true),
    
    (new_york_pizzeria_cafe_id, 'Smoking Special (Reg)', 'Onion, Green Capsicum, Mushroom, Pineapple, Olives, Corn, Fresh Pizza Sauce & 100% Mozzarella Cheese - Regular (7")', 210, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Smoking Special (Med)', 'Onion, Green Capsicum, Mushroom, Pineapple, Olives, Corn, Fresh Pizza Sauce & 100% Mozzarella Cheese - Medium (10")', 390, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Smoking Special (X. Large)', 'Onion, Green Capsicum, Mushroom, Pineapple, Olives, Corn, Fresh Pizza Sauce & 100% Mozzarella Cheese - X. Large (18")', 815, 'Veg. Pizzas', true),
    
    (new_york_pizzeria_cafe_id, 'Veg Feast (Reg)', 'Onion, Red, Yellow and Green Capsicum, Mushroom, Olives, Corn, Jalapeno. Fresh Pizza Sauce & 100% Mozzarella Cheese - Regular (7")', 210, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Veg Feast (Med)', 'Onion, Red, Yellow and Green Capsicum, Mushroom, Olives, Corn, Jalapeno. Fresh Pizza Sauce & 100% Mozzarella Cheese - Medium (10")', 390, 'Veg. Pizzas', true),
    (new_york_pizzeria_cafe_id, 'Veg Feast (X. Large)', 'Onion, Red, Yellow and Green Capsicum, Mushroom, Olives, Corn, Jalapeno. Fresh Pizza Sauce & 100% Mozzarella Cheese - X. Large (18")', 815, 'Veg. Pizzas', true);
    
    -- ========================================
    -- CREAMY NEW YORK STYLE PIZZA
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (new_york_pizzeria_cafe_id, 'Creamy Onion + Capsicum', 'Creamy New York Style Pizza with Onion and Capsicum', 100, 'Creamy New York Style Pizza', true),
    (new_york_pizzeria_cafe_id, 'Creamy Paneer + Onion', 'Creamy New York Style Pizza with Paneer and Onion', 110, 'Creamy New York Style Pizza', true),
    (new_york_pizzeria_cafe_id, 'Creamy Tomato + Corn', 'Creamy New York Style Pizza with Tomato and Corn', 110, 'Creamy New York Style Pizza', true),
    (new_york_pizzeria_cafe_id, 'Creamy Jalapeno + Pineapple', 'Creamy New York Style Pizza with Jalapeno and Pineapple', 110, 'Creamy New York Style Pizza', true);
    
    -- ========================================
    -- CHOICE OF PIZZA CRUST
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (new_york_pizzeria_cafe_id, 'Cheese Burst (R)', 'Cheese Burst Crust - Regular', 55, 'Choice of Pizza Crust', true),
    (new_york_pizzeria_cafe_id, 'Cheese Burst (M)', 'Cheese Burst Crust - Medium', 100, 'Choice of Pizza Crust', true);
    
    -- ========================================
    -- EXTRA VEG TOPPINGS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (new_york_pizzeria_cafe_id, 'Extra Veg Topping (Small)', 'Onion / Capsicum / Tomato / Corn / Mushroom / Olive / Jalapeno / Baby Corn / Red Pepper / Paneer / Mozzarella Cheese - Small', 45, 'Extra Veg Toppings', true),
    (new_york_pizzeria_cafe_id, 'Extra Veg Topping (Medium)', 'Onion / Capsicum / Tomato / Corn / Mushroom / Olive / Jalapeno / Baby Corn / Red Pepper / Paneer / Mozzarella Cheese - Medium', 55, 'Extra Veg Toppings', true),
    (new_york_pizzeria_cafe_id, 'Extra Veg Topping (Large)', 'Onion / Capsicum / Tomato / Corn / Mushroom / Olive / Jalapeno / Baby Corn / Red Pepper / Paneer / Mozzarella Cheese - Large', 95, 'Extra Veg Toppings', true);
    
    -- ========================================
    -- SIDES
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (new_york_pizzeria_cafe_id, 'French Fries', 'Classic French Fries', 120, 'Sides', true),
    (new_york_pizzeria_cafe_id, 'Cheese French Fries', 'French Fries with Cheese', 130, 'Sides', true),
    (new_york_pizzeria_cafe_id, 'Cheese Garlic Bread (with Dip)', 'Cheese Garlic Bread served with Dip', 150, 'Sides', true),
    (new_york_pizzeria_cafe_id, 'Calzone Pocket Veg (2pcs)', 'Onion, Green Capsicum, Red Pepper, Paneer With Cheese - 2 pieces', 130, 'Sides', true),
    (new_york_pizzeria_cafe_id, 'Taco Mexicana Veg', 'Served with Herb Chilly Patty, Harissa Sauce, Peri Peri Seasoning', 130, 'Sides', true),
    (new_york_pizzeria_cafe_id, 'Spring Roll (2pcs)', 'Crispy Spring Rolls - 2 pieces', 120, 'Sides', true),
    (new_york_pizzeria_cafe_id, 'Hara Bhara Kebab (12pcs)', 'Hara Bhara Kebabs - 12 pieces', 130, 'Sides', true),
    (new_york_pizzeria_cafe_id, 'Cheese Corn Roll (6pcs)', 'Cheese Corn Rolls - 6 pieces', 150, 'Sides', true),
    (new_york_pizzeria_cafe_id, 'Cheese Ball (10pcs)', 'Cheese Balls - 10 pieces', 150, 'Sides', true);
    
    -- ========================================
    -- SALADS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (new_york_pizzeria_cafe_id, 'Veg Hawaiian Salad', 'Lettuce, Onion, Green Capsicum, Olive, Cucumber, Tomato, Pineapple', 160, 'Salads', true),
    (new_york_pizzeria_cafe_id, 'Farm Fresh Salad', 'Lettuce, Onion, Green Capsicum, Olive, Tomato, Cucumber', 160, 'Salads', true);
    
    -- ========================================
    -- DELICIOUS SHAKES
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (new_york_pizzeria_cafe_id, 'Kit Kat Shake', 'Kit Kat flavored shake', 125, 'Delicious Shakes', true),
    (new_york_pizzeria_cafe_id, 'Oreo Shake', 'Oreo flavored shake', 125, 'Delicious Shakes', true),
    (new_york_pizzeria_cafe_id, 'Butterscotch Shake', 'Butterscotch flavored shake', 125, 'Delicious Shakes', true),
    (new_york_pizzeria_cafe_id, 'Chocolate Shake', 'Chocolate shake', 125, 'Delicious Shakes', true),
    (new_york_pizzeria_cafe_id, 'Strawberry Shake', 'Strawberry shake', 125, 'Delicious Shakes', true),
    (new_york_pizzeria_cafe_id, 'Cold Coffee', 'Classic cold coffee', 125, 'Delicious Shakes', true),
    (new_york_pizzeria_cafe_id, 'Mango Shake', 'Mango shake', 125, 'Delicious Shakes', true);
    
    -- ========================================
    -- PASTA PENNE
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (new_york_pizzeria_cafe_id, 'Veg. Pasta', 'Green Capsicum, Mushroom, Corn, Served With Choice of Pasta Sauce', 150, 'Pasta Penne', true);
    
    -- ========================================
    -- WRAPS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (new_york_pizzeria_cafe_id, 'Cheese Wrap', 'Chipotle Sauce, Cheese Slice, Onion, Tomato, Cucumber, Lettuce & Cheese', 130, 'Wraps', true),
    (new_york_pizzeria_cafe_id, 'Masala Wrap', 'Herb Chilly Patty, Tomato, Lettuce, Onion, Cucumber, Cheese, Thousand Dressing', 130, 'Wraps', true),
    (new_york_pizzeria_cafe_id, 'Paneer Tikka Wrap', 'Chipotle Sauce, Peri Peri Paneer, Onion, Tomato, Cucumber, Lettuce & Cheese', 160, 'Wraps', true);
    
    -- ========================================
    -- BEVERAGES
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (new_york_pizzeria_cafe_id, 'Lemonade', 'Refreshing lemonade', 110, 'Beverages', true),
    (new_york_pizzeria_cafe_id, 'Green Apple Mojito', 'Green apple flavored mojito', 110, 'Beverages', true),
    (new_york_pizzeria_cafe_id, 'Virgin Mojito', 'Classic virgin mojito', 110, 'Beverages', true),
    (new_york_pizzeria_cafe_id, 'Blue Lagoon', 'Blue lagoon mocktail', 110, 'Beverages', true),
    (new_york_pizzeria_cafe_id, 'Coke (R)', 'Coca Cola - Regular', 30, 'Beverages', true),
    (new_york_pizzeria_cafe_id, 'Coke (M)', 'Coca Cola - Medium', 50, 'Beverages', true),
    (new_york_pizzeria_cafe_id, 'Coke (L)', 'Coca Cola - Large', 70, 'Beverages', true),
    (new_york_pizzeria_cafe_id, 'Fanta (R)', 'Fanta - Regular', 30, 'Beverages', true),
    (new_york_pizzeria_cafe_id, 'Fanta (M)', 'Fanta - Medium', 50, 'Beverages', true),
    (new_york_pizzeria_cafe_id, 'Fanta (L)', 'Fanta - Large', 70, 'Beverages', true),
    (new_york_pizzeria_cafe_id, 'Sprite (R)', 'Sprite - Regular', 30, 'Beverages', true),
    (new_york_pizzeria_cafe_id, 'Sprite (M)', 'Sprite - Medium', 50, 'Beverages', true),
    (new_york_pizzeria_cafe_id, 'Sprite (L)', 'Sprite - Large', 70, 'Beverages', true),
    (new_york_pizzeria_cafe_id, 'Limca (R)', 'Limca - Regular', 30, 'Beverages', true),
    (new_york_pizzeria_cafe_id, 'Limca (M)', 'Limca - Medium', 50, 'Beverages', true),
    (new_york_pizzeria_cafe_id, 'Limca (L)', 'Limca - Large', 70, 'Beverages', true);
    
    -- ========================================
    -- BURGER
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (new_york_pizzeria_cafe_id, 'Veg Burger', 'Classic vegetable burger', 39, 'Burger', true),
    (new_york_pizzeria_cafe_id, 'Paneer Burger', 'Paneer burger', 59, 'Burger', true);
    
    -- ========================================
    -- DESSERTS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (new_york_pizzeria_cafe_id, 'Chocolate Cake', 'Chocolate cake', 110, 'Desserts', true),
    (new_york_pizzeria_cafe_id, 'Chocolate Brownie', 'Chocolate brownie', 110, 'Desserts', true),
    (new_york_pizzeria_cafe_id, 'Ice Cream Single Scoop (on Dessert)', 'Single scoop ice cream on dessert', 40, 'Desserts', true);
    
    -- ========================================
    -- SANDWICH
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (new_york_pizzeria_cafe_id, 'Veg Sandwich', 'Classic vegetable sandwich', 80, 'Sandwich', true),
    (new_york_pizzeria_cafe_id, 'Cheese Corn Sandwich', 'Cheese and corn sandwich', 100, 'Sandwich', true),
    (new_york_pizzeria_cafe_id, 'Paneer Tikka Sandwich', 'Paneer tikka sandwich', 120, 'Sandwich', true);
    
    RAISE NOTICE 'New York Pizzeria cafe successfully added/updated with % menu items', (SELECT COUNT(*) FROM public.menu_items WHERE cafe_id = new_york_pizzeria_cafe_id);
END $$;

-- Verify the cafe was created
SELECT 
    id, 
    name, 
    slug, 
    location_scope, 
    priority, 
    image_url,
    accepting_orders,
    is_active
FROM public.cafes 
WHERE slug = 'newyorkpizzeria';

-- Count menu items
SELECT 
    category,
    COUNT(*) as item_count
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE slug = 'newyorkpizzeria')
GROUP BY category
ORDER BY category;

