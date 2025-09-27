-- Restore Cook House cafe and menu
-- Run this in Supabase Dashboard → SQL Editor

-- Add 'COOK HOUSE' restaurant with comprehensive multi-cuisine menu
-- Insert the cafe
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
    'COOK HOUSE',
    'Multi-Cuisine',
    'A culinary haven offering diverse flavors from Chinese specialties to authentic Indian cuisine. From sizzling starters to hearty main courses, we bring you the best of multiple cuisines under one roof. Perfect for every craving!',
    'G1 First Floor',
    '+91-98765 43210',
    '11:00 AM - 2:00 AM',
    true,
    NOW(),
    NOW()
);

-- Get the cafe ID for menu items
DO $$
DECLARE
    cafe_id UUID;
BEGIN
    -- Get the cafe ID
    SELECT id INTO cafe_id FROM public.cafes WHERE name = 'COOK HOUSE';
    
    -- ========================================
    -- CHINA WALL SECTION
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cafe_id, 'Spring Roll', 'Crispy vegetable spring rolls', 180, 'China Wall', true),
    (cafe_id, 'Honey Chilli Potato', 'Sweet and spicy honey chili potatoes', 180, 'China Wall', true),
    (cafe_id, 'Crispy Chilly Paneer (Dry)', 'Crispy paneer in chili sauce - dry', 260, 'China Wall', true),
    (cafe_id, 'Crispy Chilly Paneer (Gravy)', 'Crispy paneer in chili sauce - gravy', 260, 'China Wall', true),
    (cafe_id, 'Crispy Chilli Mushroom', 'Crispy mushrooms in chili sauce', 220, 'China Wall', true),
    (cafe_id, 'Crispy Corn Salt n Pepper', 'Crispy corn with salt and pepper', 180, 'China Wall', true),
    (cafe_id, 'Veg Manchurian (Dry)', 'Vegetable manchurian - dry', 180, 'China Wall', true),
    (cafe_id, 'Veg Manchurian (Gravy)', 'Vegetable manchurian - gravy', 200, 'China Wall', true),
    (cafe_id, 'Veg Fried Rice', 'Vegetable fried rice', 200, 'China Wall', true),
    (cafe_id, 'Veg Schezwan Rice', 'Vegetable schezwan rice', 210, 'China Wall', true),
    (cafe_id, 'Steam Momos (6 pcs)', 'Steamed vegetable momos - 6 pieces', 130, 'China Wall', true),
    (cafe_id, 'Fried Momos (6 pcs)', 'Fried vegetable momos - 6 pieces', 140, 'China Wall', true),
    (cafe_id, 'Vegetable Hakka Noodles', 'Vegetable hakka noodles', 150, 'China Wall', true),
    (cafe_id, 'Chilli Garlic Noodles', 'Chili garlic noodles', 160, 'China Wall', true),
    (cafe_id, 'Chicken Fried Rice', 'Chicken fried rice', 210, 'China Wall', true),
    (cafe_id, 'Chicken Hakka Noodles', 'Chicken hakka noodles', 200, 'China Wall', true),
    (cafe_id, 'Chilli Chicken', 'Spicy chili chicken', 290, 'China Wall', true);

    -- ========================================
    -- BREADS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cafe_id, 'Tandoori Roti (Plain)', 'Plain tandoori roti', 18, 'Breads', true),
    (cafe_id, 'Tandoori Roti (Butter)', 'Butter tandoori roti', 22, 'Breads', true),
    (cafe_id, 'Missi Roti', 'Traditional missi roti', 55, 'Breads', true),
    (cafe_id, 'Pudina Laccha Paratha (Plain)', 'Mint laccha paratha - plain', 50, 'Breads', true),
    (cafe_id, 'Pudina Laccha Paratha (Butter)', 'Mint laccha paratha - butter', 60, 'Breads', true),
    (cafe_id, 'Hari Mirch Laccha Paratha (Plain)', 'Green chili laccha paratha - plain', 55, 'Breads', true),
    (cafe_id, 'Hari Mirch Laccha Paratha (Butter)', 'Green chili laccha paratha - butter', 60, 'Breads', true),
    (cafe_id, 'Laccha Paratha (Plain)', 'Layered laccha paratha - plain', 55, 'Breads', true),
    (cafe_id, 'Laccha Paratha (Butter)', 'Layered laccha paratha - butter', 60, 'Breads', true),
    (cafe_id, 'Naan (Plain)', 'Plain naan', 50, 'Breads', true),
    (cafe_id, 'Naan (Butter)', 'Butter naan', 55, 'Breads', true),
    (cafe_id, 'Garlic Naan (Plain)', 'Garlic naan - plain', 65, 'Breads', true),
    (cafe_id, 'Garlic Naan (Butter)', 'Garlic naan - butter', 75, 'Breads', true),
    (cafe_id, 'Cheese Naan', 'Cheese stuffed naan', 90, 'Breads', true),
    (cafe_id, 'Cheese Garlic Naan', 'Cheese garlic naan', 110, 'Breads', true),
    (cafe_id, 'Chur Chur Naan', 'Chur chur naan', 80, 'Breads', true);

    -- ========================================
    -- MAIN COURSE (VEG) - VEG GRAVY
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cafe_id, 'Palak Paneer (Half)', 'Spinach paneer - half portion', 200, 'Veg Main Course', true),
    (cafe_id, 'Palak Paneer (Full)', 'Spinach paneer - full portion', 280, 'Veg Main Course', true),
    (cafe_id, 'Shahi Paneer (Half)', 'Royal paneer - half portion', 200, 'Veg Main Course', true),
    (cafe_id, 'Shahi Paneer (Full)', 'Royal paneer - full portion', 280, 'Veg Main Course', true),
    (cafe_id, 'Kadhai Paneer (Half)', 'Kadhai style paneer - half portion', 190, 'Veg Main Course', true),
    (cafe_id, 'Kadhai Paneer (Full)', 'Kadhai style paneer - full portion', 280, 'Veg Main Course', true),
    (cafe_id, 'Paneer Tikka Masala (Half)', 'Paneer tikka masala - half portion', 210, 'Veg Main Course', true),
    (cafe_id, 'Paneer Tikka Masala (Full)', 'Paneer tikka masala - full portion', 290, 'Veg Main Course', true);

    -- ========================================
    -- DAL DARSHAN
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cafe_id, 'Dal Maharani (Half)', 'Royal dal makhni - half portion', 190, 'Dal Darshan', true),
    (cafe_id, 'Dal Maharani (Full)', 'Royal dal makhni - full portion', 260, 'Dal Darshan', true),
    (cafe_id, 'Dal Dhaba (Half)', 'Dhaba style dal - half portion', 170, 'Dal Darshan', true),
    (cafe_id, 'Dal Dhaba (Full)', 'Dhaba style dal - full portion', 210, 'Dal Darshan', true);

    -- ========================================
    -- RICE
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cafe_id, 'Navaratna Pulao', 'Nine-gem rice pulao', 280, 'Rice', true),
    (cafe_id, 'Jeera Rice', 'Cumin rice', 200, 'Rice', true),
    (cafe_id, 'Plain Rice', 'Plain steamed rice', 180, 'Rice', true),
    (cafe_id, 'Curd Rice', 'Yogurt rice', 210, 'Rice', true);

    -- ========================================
    -- DRINKS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (cafe_id, 'Coke', 'Coca Cola', 20, 'Drinks', true),
    (cafe_id, 'Fanta', 'Fanta Orange', 20, 'Drinks', true),
    (cafe_id, 'Mirinda', 'Mirinda Orange', 20, 'Drinks', true),
    (cafe_id, 'Sprite', 'Sprite Lemon', 20, 'Drinks', true),
    (cafe_id, 'Curd', 'Fresh curd', 70, 'Drinks', true);

    RAISE NOTICE 'COOK HOUSE restaurant with menu added successfully';
END $$;

-- Verification
SELECT 'COOK HOUSE RESTORED' as status;
SELECT COUNT(*) as cafe_count FROM public.cafes WHERE name = 'COOK HOUSE';
SELECT COUNT(*) as menu_item_count FROM public.menu_items mi 
JOIN public.cafes c ON mi.cafe_id = c.id 
WHERE c.name = 'COOK HOUSE';
