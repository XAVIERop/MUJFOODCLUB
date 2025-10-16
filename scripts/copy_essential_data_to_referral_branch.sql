-- Copy essential production data to referral-system branch
-- This script copies only the data needed for testing, preserving referral tables

-- 1. Copy cafes table (essential for homepage)
INSERT INTO public.cafes (id, name, description, image_url, priority, is_active, accepting_orders, created_at, updated_at)
SELECT id, name, description, image_url, priority, is_active, accepting_orders, created_at, updated_at
FROM (
    -- Sample cafes data (you can expand this)
    VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Food Court', 'Multi-cuisine food court', 'foodcourt_logo.png', 1, true, true, NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', 'Pizza Bakers', 'Authentic Italian pizzas', 'pizzabakers_logo.jpg', 2, true, true, NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333333', 'Chatkara', 'North Indian delicacies', 'chatkara_logo.jpg', 3, true, true, NOW(), NOW()),
    ('44444444-4444-4444-4444-444444444444', 'Cook House', 'Home-style cooking', 'cookhouse_logo.jpg', 4, true, true, NOW(), NOW()),
    ('55555555-5555-5555-5555-555555555555', 'Punjabi Tadka', 'Authentic Punjabi flavors', 'punjabitadka_logo.png', 5, true, true, NOW(), NOW()),
    ('66666666-6666-6666-6666-666666666666', 'Munch Box', 'Quick bites and snacks', 'munchbox_logo.png', 6, true, true, NOW(), NOW()),
    ('77777777-7777-7777-7777-777777777777', 'Mini Meals', 'Light meals and beverages', 'minimeals_logo.png', 7, true, true, NOW(), NOW()),
    ('88888888-8888-8888-8888-888888888888', 'Taste of India', 'Traditional Indian cuisine', 'tasteofindia_logo.png', 8, true, true, NOW(), NOW()),
    ('99999999-9999-9999-9999-999999999999', 'Let''s Go Live', 'Live music and food', 'letsgo_logo.png', 9, true, true, NOW(), NOW())
) AS sample_cafes(id, name, description, image_url, priority, is_active, accepting_orders, created_at, updated_at)
ON CONFLICT (id) DO NOTHING;

-- 2. Copy some sample menu items for Food Court (essential for ordering)
INSERT INTO public.menu_items (id, cafe_id, name, description, price, category, created_at, updated_at)
SELECT id, cafe_id, name, description, price, category, created_at, updated_at
FROM (
    VALUES 
    -- Food Court items
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Chicken Biryani', 'Fragrant basmati rice with tender chicken', 150.00, 'Main Course', NOW(), NOW()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Veg Fried Rice', 'Mixed vegetables with seasoned rice', 120.00, 'Main Course', NOW(), NOW()),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Chicken Curry', 'Spicy chicken curry with rice', 130.00, 'Main Course', NOW(), NOW()),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'Samosa', 'Crispy fried pastry with potato filling', 25.00, 'Snacks', NOW(), NOW()),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'Tea', 'Hot masala tea', 15.00, 'Beverages', NOW(), NOW()),
    
    -- Pizza Bakers items
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', 'Margherita Pizza (Regular)', 'Classic tomato and mozzarella', 180.00, 'Pizzas', NOW(), NOW()),
    ('gggggggg-gggg-gggg-gggg-gggggggggggg', '22222222-2222-2222-2222-222222222222', 'Margherita Pizza (Large)', 'Classic tomato and mozzarella', 280.00, 'Pizzas', NOW(), NOW()),
    ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '22222222-2222-2222-2222-222222222222', 'Pepperoni Pizza (Regular)', 'Spicy pepperoni with cheese', 220.00, 'Pizzas', NOW(), NOW()),
    ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', '22222222-2222-2222-2222-222222222222', 'Pepperoni Pizza (Large)', 'Spicy pepperoni with cheese', 320.00, 'Pizzas', NOW(), NOW())
) AS sample_items(id, cafe_id, name, description, price, category, created_at, updated_at)
ON CONFLICT (id) DO NOTHING;

-- 3. Verify the data was copied
SELECT 
    'Data Copy Complete!' as status,
    (SELECT COUNT(*) FROM public.cafes) as cafes_count,
    (SELECT COUNT(*) FROM public.menu_items) as menu_items_count,
    (SELECT COUNT(*) FROM public.referral_codes) as referral_codes_count;
