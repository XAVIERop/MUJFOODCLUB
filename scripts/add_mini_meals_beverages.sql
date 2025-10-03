-- Add missing beverage items to Mini Meals menu
-- Based on the provided menu images

-- ========================================
-- SHAKES (with Medium and Large sizes)
-- ========================================
INSERT INTO public.menu_items (cafe_id, name, description, price, category, preparation_time, is_available) VALUES
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Oreo Shake (M)', 'Creamy oreo milkshake - Medium', 70.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Oreo Shake (L)', 'Creamy oreo milkshake - Large', 90.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Chocolate Oreo Shake (M)', 'Chocolate oreo milkshake - Medium', 80.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Chocolate Oreo Shake (L)', 'Chocolate oreo milkshake - Large', 100.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Kitkat Oreo Shake (M)', 'Kitkat oreo milkshake - Medium', 90.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Kitkat Oreo Shake (L)', 'Kitkat oreo milkshake - Large', 100.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Chocolate Brownie Shake (M)', 'Chocolate brownie milkshake - Medium', 90.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Chocolate Brownie Shake (L)', 'Chocolate brownie milkshake - Large', 110.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Bournvita Shake (M)', 'Bournvita milkshake - Medium', 80.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Bournvita Shake (L)', 'Bournvita milkshake - Large', 100.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Kitkat Shake (M)', 'Kitkat milkshake - Medium', 80.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Kitkat Shake (L)', 'Kitkat milkshake - Large', 100.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Cold Coffee (M)', 'Cold coffee - Medium', 60.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Cold Coffee (L)', 'Cold coffee - Large', 80.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Blue Berry Shake (M)', 'Blue berry milkshake - Medium', 70.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Blue Berry Shake (L)', 'Blue berry milkshake - Large', 80.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Vanilla Shake (M)', 'Vanilla milkshake - Medium', 60.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Vanilla Shake (L)', 'Vanilla milkshake - Large', 80.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Rose Shake (M)', 'Rose milkshake - Medium', 60.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Rose Shake (L)', 'Rose milkshake - Large', 80.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Black Current Shake (M)', 'Black current milkshake - Medium', 60.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Black Current Shake (L)', 'Black current milkshake - Large', 80.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Butter Scotch Shake (M)', 'Butter scotch milkshake - Medium', 70.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Butter Scotch Shake (L)', 'Butter scotch milkshake - Large', 90.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Chocolate Shake (M)', 'Chocolate milkshake - Medium', 70.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Chocolate Shake (L)', 'Chocolate milkshake - Large', 90.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Badam/Thandai Shake (M)', 'Badam/Thandai milkshake - Medium', 70.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Badam/Thandai Shake (L)', 'Badam/Thandai milkshake - Large', 100.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Pan Bahar Shake (M)', 'Pan bahar milkshake - Medium', 60.00, 'Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Pan Bahar Shake (L)', 'Pan bahar milkshake - Large', 80.00, 'Shakes', 8, true);

-- ========================================
-- MOCKTAILS (with Medium and Large sizes)
-- ========================================
INSERT INTO public.menu_items (cafe_id, name, description, price, category, preparation_time, is_available) VALUES
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Mint Mojito (M)', 'Refreshing mint mojito - Medium', 60.00, 'Mocktails', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Mint Mojito (L)', 'Refreshing mint mojito - Large', 80.00, 'Mocktails', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Green Apple Soda (M)', 'Green apple soda - Medium', 60.00, 'Mocktails', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Green Apple Soda (L)', 'Green apple soda - Large', 80.00, 'Mocktails', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Blue Lagoon (M)', 'Blue lagoon mocktail - Medium', 60.00, 'Mocktails', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Blue Lagoon (L)', 'Blue lagoon mocktail - Large', 80.00, 'Mocktails', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Watermelon Soda (M)', 'Watermelon soda - Medium', 60.00, 'Mocktails', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Watermelon Soda (L)', 'Watermelon soda - Large', 80.00, 'Mocktails', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Mix Fruit Mocktail (M)', 'Mix fruit mocktail - Medium', 60.00, 'Mocktails', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Mix Fruit Mocktail (L)', 'Mix fruit mocktail - Large', 80.00, 'Mocktails', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Aam Panna (M)', 'Aam panna (seasonal) - Medium', 60.00, 'Mocktails', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Aam Panna (L)', 'Aam panna (seasonal) - Large', 80.00, 'Mocktails', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Kala Khatta (M)', 'Kala khatta - Medium', 50.00, 'Mocktails', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Kala Khatta (L)', 'Kala khatta - Large', 70.00, 'Mocktails', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Bubblegum (M)', 'Bubblegum mocktail - Medium', 50.00, 'Mocktails', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Bubblegum (L)', 'Bubblegum mocktail - Large', 70.00, 'Mocktails', 8, true);

-- ========================================
-- HOT BEVERAGES (with Medium and Large sizes)
-- ========================================
INSERT INTO public.menu_items (cafe_id, name, description, price, category, preparation_time, is_available) VALUES
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Tea', 'Hot tea', 20.00, 'Hot Beverages', 5, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Kulad Tea (M)', 'Kulad tea - Medium', 20.00, 'Hot Beverages', 5, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Kulad Tea (L)', 'Kulad tea - Large', 30.00, 'Hot Beverages', 5, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Hot Coffee', 'Hot coffee', 20.00, 'Hot Beverages', 5, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Hot Milk', 'Hot milk', 40.00, 'Hot Beverages', 5, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Hot Chocolate Milk', 'Hot chocolate milk', 60.00, 'Hot Beverages', 5, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Turmeric Milk', 'Turmeric milk', 50.00, 'Hot Beverages', 5, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Flavour Milk', 'Flavour milk (Kesariya Badam, Chocolate)', 50.00, 'Hot Beverages', 5, true);

-- ========================================
-- JUICE (with Medium and Large sizes)
-- ========================================
INSERT INTO public.menu_items (cafe_id, name, description, price, category, preparation_time, is_available) VALUES
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Pineapple Juice (M)', 'Fresh pineapple juice - Medium', 50.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Pineapple Juice (L)', 'Fresh pineapple juice - Large', 70.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Watermelon Juice (M)', 'Fresh watermelon juice (seasonal) - Medium', 50.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Watermelon Juice (L)', 'Fresh watermelon juice (seasonal) - Large', 70.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Carrot Juice (M)', 'Fresh carrot juice (seasonal) - Medium', 50.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Carrot Juice (L)', 'Fresh carrot juice (seasonal) - Large', 70.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Orange Juice (M)', 'Fresh orange juice (seasonal) - Medium', 60.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Orange Juice (L)', 'Fresh orange juice (seasonal) - Large', 80.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Mango Juice (M)', 'Fresh mango juice - Medium', 60.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Mango Juice (L)', 'Fresh mango juice - Large', 80.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Papaya Juice (M)', 'Fresh papaya juice - Medium', 60.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Papaya Juice (L)', 'Fresh papaya juice - Large', 80.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Beal Juice (M)', 'Fresh beal juice - Medium', 60.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Beal Juice (L)', 'Fresh beal juice - Large', 80.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Black Grapes Juice (M)', 'Fresh black grapes juice (seasonal) - Medium', 60.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Black Grapes Juice (L)', 'Fresh black grapes juice (seasonal) - Large', 80.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Kiwi Juice (M)', 'Fresh kiwi juice (seasonal) - Medium', 60.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Kiwi Juice (L)', 'Fresh kiwi juice (seasonal) - Large', 80.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Pomegranate Juice (M)', 'Fresh pomegranate juice - Medium', 80.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Pomegranate Juice (L)', 'Fresh pomegranate juice - Large', 90.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Strawberry Juice (M)', 'Fresh strawberry juice (seasonal) - Medium', 70.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Strawberry Juice (L)', 'Fresh strawberry juice (seasonal) - Large', 90.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Apple Juice (M)', 'Fresh apple juice - Medium', 80.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Apple Juice (L)', 'Fresh apple juice - Large', 90.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Mix Fruit Juice (M)', 'Fresh mix fruit juice - Medium', 70.00, 'Juice', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Mix Fruit Juice (L)', 'Fresh mix fruit juice - Large', 90.00, 'Juice', 8, true);

-- ========================================
-- FRUIT SHAKES (with Medium and Large sizes)
-- ========================================
INSERT INTO public.menu_items (cafe_id, name, description, price, category, preparation_time, is_available) VALUES
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Banana Shake (M)', 'Fresh banana shake - Medium', 60.00, 'Fruit Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Banana Shake (L)', 'Fresh banana shake - Large', 80.00, 'Fruit Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Beal Shake (M)', 'Fresh beal shake (seasonal) - Medium', 60.00, 'Fruit Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Beal Shake (L)', 'Fresh beal shake (seasonal) - Large', 80.00, 'Fruit Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Papaya Shake (M)', 'Fresh papaya shake - Medium', 60.00, 'Fruit Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Papaya Shake (L)', 'Fresh papaya shake - Large', 80.00, 'Fruit Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Mango Shake (M)', 'Fresh mango shake (seasonal) - Medium', 70.00, 'Fruit Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Mango Shake (L)', 'Fresh mango shake (seasonal) - Large', 80.00, 'Fruit Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Pineapple Shake (M)', 'Fresh pineapple shake - Medium', 70.00, 'Fruit Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Pineapple Shake (L)', 'Fresh pineapple shake - Large', 90.00, 'Fruit Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Strawberry Shake (M)', 'Fresh strawberry shake (seasonal) - Medium', 70.00, 'Fruit Shakes', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Strawberry Shake (L)', 'Fresh strawberry shake (seasonal) - Large', 90.00, 'Fruit Shakes', 8, true);

-- ========================================
-- LEMON SPICY (with Medium and Large sizes)
-- ========================================
INSERT INTO public.menu_items (cafe_id, name, description, price, category, preparation_time, is_available) VALUES
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Nimbu Pani (M)', 'Fresh nimbu pani - Medium', 40.00, 'Lemon Spicy', 5, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Nimbu Pani (L)', 'Fresh nimbu pani - Large', 60.00, 'Lemon Spicy', 5, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Nimbu Soda (M)', 'Fresh nimbu soda - Medium', 60.00, 'Lemon Spicy', 5, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Nimbu Soda (L)', 'Fresh nimbu soda - Large', 80.00, 'Lemon Spicy', 5, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Ice Tea (M)', 'Refreshing ice tea - Medium', 40.00, 'Lemon Spicy', 5, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Ice Tea (L)', 'Refreshing ice tea - Large', 60.00, 'Lemon Spicy', 5, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Ice Tea With Soda (M)', 'Ice tea with soda - Medium', 50.00, 'Lemon Spicy', 5, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Ice Tea With Soda (L)', 'Ice tea with soda - Large', 70.00, 'Lemon Spicy', 5, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Masala Chach (M)', 'Spicy masala chach - Medium', 40.00, 'Lemon Spicy', 5, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Masala Chach (L)', 'Spicy masala chach - Large', 60.00, 'Lemon Spicy', 5, true);

-- ========================================
-- LASSI/KULHAD (with Medium and Large sizes)
-- ========================================
INSERT INTO public.menu_items (cafe_id, name, description, price, category, preparation_time, is_available) VALUES
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Lassi (M)', 'Traditional lassi - Medium', 50.00, 'Lassi/Kulhad', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Lassi (L)', 'Traditional lassi - Large', 70.00, 'Lassi/Kulhad', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Flv. Lassi (M)', 'Flavored lassi - Medium', 60.00, 'Lassi/Kulhad', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Flv. Lassi (L)', 'Flavored lassi - Large', 80.00, 'Lassi/Kulhad', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Ice-cream Lassi (M)', 'Ice-cream lassi - Medium', 70.00, 'Lassi/Kulhad', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Ice-cream Lassi (L)', 'Ice-cream lassi - Large', 90.00, 'Lassi/Kulhad', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Flv. Ice-cream Lassi (M)', 'Flavored ice-cream lassi - Medium', 70.00, 'Lassi/Kulhad', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Flv. Ice-cream Lassi (L)', 'Flavored ice-cream lassi - Large', 90.00, 'Lassi/Kulhad', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Flv. Lassi-rose (M)', 'Flavored rose lassi - Medium', 70.00, 'Lassi/Kulhad', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Flv. Lassi-rose (L)', 'Flavored rose lassi - Large', 90.00, 'Lassi/Kulhad', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Mango Lassi', 'Mango lassi (seasonal)', 0.00, 'Lassi/Kulhad', 8, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Kesariya Lassi', 'Kesariya lassi (seasonal)', 0.00, 'Lassi/Kulhad', 8, true);

-- ========================================
-- ADDITIONAL MISSING FOOD ITEMS
-- ========================================

-- Missing Momos items from the menu
INSERT INTO public.menu_items (cafe_id, name, description, price, category, preparation_time, is_available) VALUES
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Veg Delight Momos', 'Special vegetable delight momos', 130.00, 'Momos Corner', 12, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Paneer Delight Momos', 'Special paneer delight momos', 150.00, 'Momos Corner', 12, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Chicken Delight Momos', 'Special chicken delight momos', 160.00, 'Momos Corner', 12, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Veg KFC Momos', 'Korean fried chicken style veg momos', 130.00, 'Momos Corner', 15, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Paneer KFC Momos', 'Korean fried chicken style paneer momos', 150.00, 'Momos Corner', 15, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Chicken KFC Momos', 'Korean fried chicken style chicken momos', 160.00, 'Momos Corner', 15, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Cheese Corn Momos', 'Cheese corn momos', 150.00, 'Momos Corner', 12, true);

-- Missing Non-Veg Combos
INSERT INTO public.menu_items (cafe_id, name, description, price, category, preparation_time, is_available) VALUES
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Chicken Manchurian + Fry Rice', 'Chicken manchurian with fried rice', 240.00, 'Non-Veg Combos', 20, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Chicken Manchurian + Egg Rice', 'Chicken manchurian with egg rice', 250.00, 'Non-Veg Combos', 20, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Chicken Manchurian + Egg Hakka', 'Chicken manchurian with egg hakka', 250.00, 'Non-Veg Combos', 20, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Chicken Manchurian + Chicken Hakka', 'Chicken manchurian with chicken hakka', 260.00, 'Non-Veg Combos', 20, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Chicken Manchurian + Schezwan Chicken Rice', 'Chicken manchurian with schezwan chicken rice', 270.00, 'Non-Veg Combos', 20, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Chilli Chicken + Noodles/Rice', 'Chilli chicken with noodles or rice', 220.00, 'Non-Veg Combos', 20, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Chicken Hot Garlic Sauce + Noodles/Rice', 'Chicken hot garlic sauce with noodles or rice', 220.00, 'Non-Veg Combos', 20, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Chicken Manchurian Gravy + Noodles/Rice', 'Chicken manchurian gravy with noodles or rice', 220.00, 'Non-Veg Combos', 20, true);

-- Mini Meals Special Non-Veg
INSERT INTO public.menu_items (cafe_id, name, description, price, category, preparation_time, is_available) VALUES
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Mini Meals Special Non-Veg', '(4 PCS) Chicken Momos + French Fry + Chilli Chicken + Rice Noodles + Cold Drink', 380.00, 'Mini Meals Special', 25, true);

-- Missing Noodles/Rice items
INSERT INTO public.menu_items (cafe_id, name, description, price, category, preparation_time, is_available) VALUES
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Plain Rice', 'Plain steamed rice', 100.00, 'Noodles/Rice', 10, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Fried Rice', 'Vegetable fried rice', 120.00, 'Noodles/Rice', 12, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Egg Fried Rice', 'Egg fried rice', 140.00, 'Noodles/Rice', 12, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Schezwan Fried Rice', 'Schezwan fried rice', 130.00, 'Noodles/Rice', 12, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Egg Schezwan Fried Rice', 'Egg schezwan fried rice', 150.00, 'Noodles/Rice', 12, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Chicken Schezwan Fried Rice', 'Chicken schezwan fried rice', 170.00, 'Noodles/Rice', 15, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Egg Hakka Noodles', 'Egg hakka noodles', 150.00, 'Noodles/Rice', 12, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Veg Chowmin Noodles', 'Vegetable chowmin noodles', 140.00, 'Noodles/Rice', 12, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Egg Chowmin', 'Egg chowmin noodles', 150.00, 'Noodles/Rice', 12, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Egg Chilli Garlic Noodles', 'Egg chilli garlic noodles', 150.00, 'Noodles/Rice', 12, true);

-- Missing Non-Veg Appetizers
INSERT INTO public.menu_items (cafe_id, name, description, price, category, preparation_time, is_available) VALUES
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Chicken Wings', 'Spicy chicken wings', 220.00, 'Non-Veg Appetizers', 18, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Honey Chicken', 'Honey glazed chicken', 220.00, 'Non-Veg Appetizers', 18, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Chicken Tangdi', 'Chicken tangdi', 260.00, 'Non-Veg Appetizers', 20, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Chicken Salt & Paper', 'Chicken salt and pepper', 220.00, 'Non-Veg Appetizers', 18, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Dragon Chicken', 'Dragon chicken', 240.00, 'Non-Veg Appetizers', 20, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Chicken Honkeng', 'Chicken honkeng', 250.00, 'Non-Veg Appetizers', 20, true);

-- Missing Veg Appetizers
INSERT INTO public.menu_items (cafe_id, name, description, price, category, preparation_time, is_available) VALUES
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Veg Manchurian Dry', 'Dry vegetable manchurian', 150.00, 'Veg Appetizers', 15, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Broccoli Manchurian Dry', 'Dry broccoli manchurian', 170.00, 'Veg Appetizers', 15, true);

-- Missing Snacks
INSERT INTO public.menu_items (cafe_id, name, description, price, category, preparation_time, is_available) VALUES
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Chilli Chap Dry', 'Spicy chilli chap dry', 160.00, 'Snacks', 15, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Chilli Chap Gravy', 'Spicy chilli chap with gravy', 180.00, 'Snacks', 15, true),
((SELECT id FROM public.cafes WHERE name = 'Mini Meals'), 'Crispy Corn Salt & Paper', 'Crispy corn with salt and pepper', 160.00, 'Snacks', 12, true);

-- Verify the additions
SELECT 
    category,
    COUNT(*) as item_count,
    MIN(price) as min_price,
    MAX(price) as max_price
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = 'Mini Meals')
GROUP BY category
ORDER BY category;
