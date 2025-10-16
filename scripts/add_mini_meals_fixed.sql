-- Add additional Mini Meals menu items (Fixed Version)
-- This query adds new categories without using price_large column
-- Uses existing schema structure

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

    -- Insert SHAKES (Medium size only - using base price)
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_veg, is_active, image_url) VALUES
    (mini_meals_cafe_id, 'Oreo Shake', 'Medium: ₹70, Large: ₹90', 70.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Chocolate Oreo Shake', 'Medium: ₹80, Large: ₹100', 80.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Kitkat Oreo Shake', 'Medium: ₹90, Large: ₹100', 90.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Chocolate Brownie Shake', 'Medium: ₹90, Large: ₹110', 90.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Bournvita Shake', 'Medium: ₹80, Large: ₹100', 80.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Kitkat Shake', 'Medium: ₹80, Large: ₹100', 80.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Cold Coffee Shake', 'Medium: ₹60, Large: ₹80', 60.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Blue Berry Shake', 'Medium: ₹70, Large: ₹80', 70.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Vanilla Shake', 'Medium: ₹60, Large: ₹80', 60.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Rose Shake', 'Medium: ₹60, Large: ₹80', 60.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Black Current Shake', 'Medium: ₹60, Large: ₹80', 60.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Butter Scotch Shake', 'Medium: ₹70, Large: ₹90', 70.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Chocolate Shake', 'Medium: ₹70, Large: ₹90', 70.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Badam/Thandai Shake', 'Medium: ₹70, Large: ₹100', 70.00, 'SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Pan Bahar Shake', 'Medium: ₹60, Large: ₹80', 60.00, 'SHAKES', TRUE, TRUE, NULL);

    -- Insert MOCKTAILS
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_veg, is_active, image_url) VALUES
    (mini_meals_cafe_id, 'Mint Mojito', 'Medium: ₹60, Large: ₹80', 60.00, 'MOCKTAILS', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Green Apple Soda', 'Medium: ₹60, Large: ₹80', 60.00, 'MOCKTAILS', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Blue Lagoon', 'Medium: ₹60, Large: ₹80', 60.00, 'MOCKTAILS', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Watermelon Soda', 'Medium: ₹60, Large: ₹80', 60.00, 'MOCKTAILS', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Mix Fruit Mocktail', 'Medium: ₹60, Large: ₹80', 60.00, 'MOCKTAILS', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Aam Panna (seasonal)', 'Medium: ₹60, Large: ₹80', 60.00, 'MOCKTAILS', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Kala Khatta', 'Medium: ₹50, Large: ₹70', 50.00, 'MOCKTAILS', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Bubblegum', 'Medium: ₹50, Large: ₹70', 50.00, 'MOCKTAILS', TRUE, TRUE, NULL);

    -- Insert HOT Beverages
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_veg, is_active, image_url) VALUES
    (mini_meals_cafe_id, 'Tea', '₹20', 20.00, 'HOT', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Kulad Tea', 'Medium: ₹20, Large: ₹30', 20.00, 'HOT', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Hot Coffee', '₹20', 20.00, 'HOT', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Hot Milk', '₹40', 40.00, 'HOT', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Hot Chocolate Milk', '₹60', 60.00, 'HOT', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Turmeric Milk', '₹50', 50.00, 'HOT', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Flavour Milk', 'Kesariya, Badam, Chocolate - ₹50', 50.00, 'HOT', TRUE, TRUE, NULL);

    -- Insert JUICE
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_veg, is_active, image_url) VALUES
    (mini_meals_cafe_id, 'Pineapple Juice', 'Medium: ₹50, Large: ₹70', 50.00, 'JUICE', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Watermelon Juice (seasonal)', 'Medium: ₹50, Large: ₹70', 50.00, 'JUICE', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Carrot Juice (seasonal)', 'Medium: ₹50, Large: ₹70', 50.00, 'JUICE', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Orange Juice (seasonal)', 'Medium: ₹60, Large: ₹80', 60.00, 'JUICE', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Mango Juice', 'Medium: ₹60, Large: ₹80', 60.00, 'JUICE', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Papaya Juice', 'Medium: ₹60, Large: ₹80', 60.00, 'JUICE', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Beal Juice', 'Medium: ₹60, Large: ₹80', 60.00, 'JUICE', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Black Grapes (seasonal)', 'Medium: ₹60, Large: ₹80', 60.00, 'JUICE', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Kiwi Juice (seasonal)', 'Medium: ₹60, Large: ₹80', 60.00, 'JUICE', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Pomegranate Juice', 'Medium: ₹80, Large: ₹90', 80.00, 'JUICE', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Strawberry Juice (seasonal)', 'Medium: ₹70, Large: ₹90', 70.00, 'JUICE', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Apple Juice', 'Medium: ₹80, Large: ₹90', 80.00, 'JUICE', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Mix Fruit Juice', 'Medium: ₹70, Large: ₹90', 70.00, 'JUICE', TRUE, TRUE, NULL);

    -- Insert FRUIT SHAKES
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_veg, is_active, image_url) VALUES
    (mini_meals_cafe_id, 'Banana Fruit Shake', 'Medium: ₹60, Large: ₹80', 60.00, 'FRUIT SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Beal Fruit Shake (seasonal)', 'Medium: ₹60, Large: ₹80', 60.00, 'FRUIT SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Papaya Fruit Shake', 'Medium: ₹60, Large: ₹80', 60.00, 'FRUIT SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Mango Fruit Shake (seasonal)', 'Medium: ₹70, Large: ₹80', 70.00, 'FRUIT SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Pineapple Fruit Shake', 'Medium: ₹70, Large: ₹90', 70.00, 'FRUIT SHAKES', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Strawberry Fruit Shake (seasonal)', 'Medium: ₹70, Large: ₹90', 70.00, 'FRUIT SHAKES', TRUE, TRUE, NULL);

    -- Insert LEMON SPICY
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_veg, is_active, image_url) VALUES
    (mini_meals_cafe_id, 'Nimbu Pani', 'Medium: ₹40, Large: ₹60', 40.00, 'LEMON SPICY', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Nimbu Soda', 'Medium: ₹60, Large: ₹80', 60.00, 'LEMON SPICY', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Ice Tea', 'Medium: ₹40, Large: ₹60', 40.00, 'LEMON SPICY', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Ice Tea With Soda', 'Medium: ₹50, Large: ₹70', 50.00, 'LEMON SPICY', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Masala Chach', 'Medium: ₹40, Large: ₹60', 40.00, 'LEMON SPICY', TRUE, TRUE, NULL);

    -- Insert LASSI/KULHAD
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_veg, is_active, image_url) VALUES
    (mini_meals_cafe_id, 'Lassi', 'Medium: ₹50, Large: ₹70', 50.00, 'LASSI/KULHAD', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Flavoured Lassi', 'Medium: ₹60, Large: ₹80', 60.00, 'LASSI/KULHAD', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Ice-cream Lassi', 'Medium: ₹70, Large: ₹90', 70.00, 'LASSI/KULHAD', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Flavoured Ice-cream Lassi', 'Medium: ₹70, Large: ₹90', 70.00, 'LASSI/KULHAD', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Flavoured Lassi Rose', 'Medium: ₹70, Large: ₹90', 70.00, 'LASSI/KULHAD', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Mango Lassi (seasonal)', 'Seasonal item', 70.00, 'LASSI/KULHAD', TRUE, TRUE, NULL),
    (mini_meals_cafe_id, 'Kesariya Lassi (seasonal)', 'Seasonal item', 70.00, 'LASSI/KULHAD', TRUE, TRUE, NULL);

    RAISE NOTICE 'Additional Mini Meals menu items added successfully!';
    RAISE NOTICE 'New categories added: SHAKES (15 items), MOCKTAILS (8 items), HOT (7 items), JUICE (13 items), FRUIT SHAKES (6 items), LEMON SPICY (5 items), LASSI/KULHAD (7 items)';
    RAISE NOTICE 'Total new items added: 61 items';
    RAISE NOTICE 'Note: These are additional items to the existing Mini Meals menu';
    RAISE NOTICE 'Note: Price variations are mentioned in the description field';
END $$;
