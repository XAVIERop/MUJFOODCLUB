-- Add additional Mini Meals menu items
-- This query adds new categories: SHAKES, MOCKTAILS, HOT, JUICE, FRUIT SHAKES, LEMON SPICY, LASSI/KULHAD
-- Note: This adds to existing items, does not delete current menu

DO $$
DECLARE
    mini_meals_cafe_id UUID;
BEGIN
    -- Get the cafe_id for 'Mini Meals'
    SELECT id INTO mini_meals_cafe_id FROM public.cafes WHERE name = 'Mini Meals';

    -- If Mini Meals cafe does not exist, raise an error
    IF mini_meals_cafe_id IS NULL THEN
        RAISE EXCEPTION 'Cafe "Mini Meals" not found. Please ensure the cafe exists before adding menu items.';
    END IF;

    -- Note: Adding new items to existing menu, not deleting current items
    -- If you need to remove duplicates, run this query first:
    -- DELETE FROM public.menu_items WHERE cafe_id = mini_meals_cafe_id AND category IN ('SHAKES', 'MOCKTAILS', 'HOT', 'JUICE', 'FRUIT SHAKES', 'LEMON SPICY', 'LASSI/KULHAD');

    -- Insert SHAKES
    INSERT INTO public.menu_items (cafe_id, name, description, price, price_large, category, is_veg, is_active, image_url) VALUES
    (mini_meals_cafe_id, 'Oreo Shake', NULL, 70.00, 90.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Chocolate Oreo Shake', NULL, 80.00, 100.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Kitkat Oreo Shake', NULL, 90.00, 100.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Chocolate Brownie Shake', NULL, 90.00, 110.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Bournvita Shake', NULL, 80.00, 100.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Kitkat Shake', NULL, 80.00, 100.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Cold Coffee Shake', NULL, 60.00, 80.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Blue Berry Shake', NULL, 70.00, 80.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Vanilla Shake', NULL, 60.00, 80.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Rose Shake', NULL, 60.00, 80.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Black Current Shake', NULL, 60.00, 80.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Butter Scotch Shake', NULL, 70.00, 90.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Chocolate Shake', NULL, 70.00, 90.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Badam/Thandai Shake', NULL, 70.00, 100.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Pan Bahar Shake', NULL, 60.00, 80.00, 'SHAKES', TRUE, TRUE, NULL);

    -- Insert MOCKTAILS
    INSERT INTO public.menu_items (cafe_id, name, description, price, price_large, category, is_veg, is_active, image_url) VALUES
    (mini_meals_cafe_id, 'Mint Mojito', NULL, 60.00, 80.00, 'MOCKTAILS', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Green Apple Soda', NULL, 60.00, 80.00, 'MOCKTAILS', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Blue Lagoon', NULL, 60.00, 80.00, 'MOCKTAILS', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Watermelon Soda', NULL, 60.00, 80.00, 'MOCKTAILS', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Mix Fruit Mocktail', NULL, 60.00, 80.00, 'MOCKTAILS', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Aam Panna (seasonal)', NULL, 60.00, 80.00, 'MOCKTAILS', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Kala Khatta', NULL, 50.00, 70.00, 'MOCKTAILS', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Bubblegum', NULL, 50.00, 70.00, 'MOCKTAILS', TRUE, TRUE, NULL);

    -- Insert HOT Beverages
    INSERT INTO public.menu_items (cafe_id, name, description, price, price_large, category, is_veg, is_active, image_url) VALUES
    (mini_meals_cafe_id, 'Tea', NULL, 20.00, NULL, 'HOT', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Kulad Tea', NULL, 20.00, 30.00, 'HOT', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Hot Coffee', NULL, 20.00, NULL, 'HOT', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Hot Milk', NULL, 40.00, NULL, 'HOT', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Hot Chocolate Milk', NULL, 60.00, NULL, 'HOT', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Turmeric Milk', NULL, 50.00, NULL, 'HOT', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Flavour Milk', 'Kesariya, Badam, Chocolate', 50.00, NULL, 'HOT', TRUE, TRUE, NULL);

    -- Insert JUICE
    INSERT INTO public.menu_items (cafe_id, name, description, price, price_large, category, is_veg, is_active, image_url) VALUES
    (mini_meals_cafe_id, 'Pineapple Juice', NULL, 50.00, 70.00, 'JUICE', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Watermelon Juice (seasonal)', NULL, 50.00, 70.00, 'JUICE', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Carrot Juice (seasonal)', NULL, 50.00, 70.00, 'JUICE', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Orange Juice (seasonal)', NULL, 60.00, 80.00, 'JUICE', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Mango Juice', NULL, 60.00, 80.00, 'JUICE', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Papaya Juice', NULL, 60.00, 80.00, 'JUICE', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Beal Juice', NULL, 60.00, 80.00, 'JUICE', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Black Grapes (seasonal)', NULL, 60.00, 80.00, 'JUICE', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Kiwi Juice (seasonal)', NULL, 60.00, 80.00, 'JUICE', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Pomegranate Juice', NULL, 80.00, 90.00, 'JUICE', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Strawberry Juice (seasonal)', NULL, 70.00, 90.00, 'JUICE', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Apple Juice', NULL, 80.00, 90.00, 'JUICE', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Mix Fruit Juice', NULL, 70.00, 90.00, 'JUICE', TRUE, TRUE, NULL);

    -- Insert FRUIT SHAKES
    INSERT INTO public.menu_items (cafe_id, name, description, price, price_large, category, is_veg, is_active, image_url) VALUES
    (mini_meals_cafe_id, 'Banana Fruit Shake', NULL, 60.00, 80.00, 'FRUIT SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Beal Fruit Shake (seasonal)', NULL, 60.00, 80.00, 'FRUIT SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Papaya Fruit Shake', NULL, 60.00, 80.00, 'FRUIT SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Mango Fruit Shake (seasonal)', NULL, 70.00, 80.00, 'FRUIT SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Pineapple Fruit Shake', NULL, 70.00, 90.00, 'FRUIT SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Strawberry Fruit Shake (seasonal)', NULL, 70.00, 90.00, 'FRUIT SHAKES', TRUE, TRUE, NULL);

    -- Insert LEMON SPICY
    INSERT INTO public.menu_items (cafe_id, name, description, price, price_large, category, is_veg, is_active, image_url) VALUES
    (mini_meals_cafe_id, 'Nimbu Pani', NULL, 40.00, 60.00, 'LEMON SPICY', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Nimbu Soda', NULL, 60.00, 80.00, 'LEMON SPICY', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Ice Tea', NULL, 40.00, 60.00, 'LEMON SPICY', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Ice Tea With Soda', NULL, 50.00, 70.00, 'LEMON SPICY', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Masala Chach', NULL, 40.00, 60.00, 'LEMON SPICY', TRUE, TRUE, NULL);

    -- Insert LASSI/KULHAD
    INSERT INTO public.menu_items (cafe_id, name, description, price, price_large, category, is_veg, is_active, image_url) VALUES
    (mini_meals_cafe_id, 'Lassi', NULL, 50.00, 70.00, 'LASSI/KULHAD', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Flavoured Lassi', NULL, 60.00, 80.00, 'LASSI/KULHAD', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Ice-cream Lassi', NULL, 70.00, 90.00, 'LASSI/KULHAD', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Flavoured Ice-cream Lassi', NULL, 70.00, 90.00, 'LASSI/KULHAD', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Flavoured Lassi Rose', NULL, 70.00, 90.00, 'LASSI/KULHAD', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Mango Lassi (seasonal)', NULL, NULL, NULL, 'LASSI/KULHAD', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Kesariya Lassi (seasonal)', NULL, NULL, NULL, 'LASSI/KULHAD', TRUE, TRUE, NULL);

    RAISE NOTICE 'Additional Mini Meals menu items added successfully!';
    RAISE NOTICE 'New categories added: SHAKES (15 items), MOCKTAILS (8 items), HOT (7 items), JUICE (13 items), FRUIT SHAKES (6 items), LEMON SPICY (5 items), LASSI/KULHAD (7 items)';
    RAISE NOTICE 'Total new items added: 61 items';
    RAISE NOTICE 'Note: These are additional items to the existing Mini Meals menu';
END $$;

