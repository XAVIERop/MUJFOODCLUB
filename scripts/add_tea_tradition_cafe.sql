-- Add TEA TRADITION cafe with comprehensive menu from the provided images
-- Run this script directly in your Supabase SQL Editor

DO $$
DECLARE
    tea_tradition_cafe_id UUID;
BEGIN
    -- Check if Tea Tradition cafe exists, if not create it
    SELECT id INTO tea_tradition_cafe_id FROM public.cafes WHERE name = 'Tea Tradition';
    
    -- If cafe doesn't exist, create it
    IF tea_tradition_cafe_id IS NULL THEN
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
            'Tea Tradition',
            'Tea House & Multi-Cuisine',
            'Experience the perfect blend of traditional tea culture and modern cuisine! From hand-beaten coffee to exotic shakes, classic sandwiches to gourmet pizzas - we bring you the authentic taste of India with a contemporary twist. Your perfect destination for tea, coffee, and delicious food!',
            'Ground Floor, GHS',
            '+91-7737723632, +91-8690779004',
            '11:00 AM - 11:00 PM',
            true,
            NOW(),
            NOW()
        );
        
        -- Get the newly created cafe ID
        SELECT id INTO tea_tradition_cafe_id FROM public.cafes WHERE name = 'Tea Tradition';
    END IF;
    
    -- Clear existing menu items for Tea Tradition
    DELETE FROM public.menu_items WHERE cafe_id = tea_tradition_cafe_id;
    
    -- ========================================
    -- GARMA GARAM (HOT BEVERAGES)
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (tea_tradition_cafe_id, 'Lemon Tea', 'Refreshing lemon tea', 80, 'Garma Garam', true),
    (tea_tradition_cafe_id, 'Hand Beaten Coffee', 'Traditional hand beaten coffee', 70, 'Garma Garam', true),
    (tea_tradition_cafe_id, 'Green Tea', 'Healthy green tea', 60, 'Garma Garam', true),
    (tea_tradition_cafe_id, 'Hot Chocolate', 'Rich hot chocolate', 90, 'Garma Garam', true),
    (tea_tradition_cafe_id, 'Bournvita Milk', 'Bournvita flavored milk', 70, 'Garma Garam', true),
    (tea_tradition_cafe_id, 'Hot Milk', 'Warm milk', 50, 'Garma Garam', true),
    (tea_tradition_cafe_id, 'Haldi Milk', 'Turmeric milk', 70, 'Garma Garam', true);

    -- ========================================
    -- TRADITIONAL TEA
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (tea_tradition_cafe_id, 'Resar Tea (Small)', 'Traditional resar tea - small', 50, 'Traditional Tea', true),
    (tea_tradition_cafe_id, 'Resar Tea (Large)', 'Traditional resar tea - large', 80, 'Traditional Tea', true),
    (tea_tradition_cafe_id, 'Gud Tea', 'Jaggery tea', 70, 'Traditional Tea', true),
    (tea_tradition_cafe_id, 'Ginger Tea (Small)', 'Spicy ginger tea - small', 40, 'Traditional Tea', true),
    (tea_tradition_cafe_id, 'Ginger Tea (Large)', 'Spicy ginger tea - large', 60, 'Traditional Tea', true),
    (tea_tradition_cafe_id, 'Cardomon Tea (Small)', 'Cardamom flavored tea - small', 40, 'Traditional Tea', true),
    (tea_tradition_cafe_id, 'Cardomon Tea (Large)', 'Cardamom flavored tea - large', 60, 'Traditional Tea', true),
    (tea_tradition_cafe_id, 'Masala Tea (Small)', 'Spicy masala tea - small', 40, 'Traditional Tea', true),
    (tea_tradition_cafe_id, 'Masala Tea (Large)', 'Spicy masala tea - large', 60, 'Traditional Tea', true),
    (tea_tradition_cafe_id, 'Traditional Tea (Small)', 'Classic traditional tea - small', 40, 'Traditional Tea', true),
    (tea_tradition_cafe_id, 'Traditional Tea (Large)', 'Classic traditional tea - large', 60, 'Traditional Tea', true),
    (tea_tradition_cafe_id, 'Black Tea (Small)', 'Strong black tea - small', 40, 'Traditional Tea', true),
    (tea_tradition_cafe_id, 'Black Tea (Large)', 'Strong black tea - large', 60, 'Traditional Tea', true),
    (tea_tradition_cafe_id, 'Nathdwara Pudina Tea (Small)', 'Mint tea - small', 40, 'Traditional Tea', true),
    (tea_tradition_cafe_id, 'Nathdwara Pudina Tea (Large)', 'Mint tea - large', 60, 'Traditional Tea', true),
    (tea_tradition_cafe_id, 'Saunf Tea (Small)', 'Fennel tea - small', 40, 'Traditional Tea', true),
    (tea_tradition_cafe_id, 'Saunf Tea (Large)', 'Fennel tea - large', 60, 'Traditional Tea', true);

    -- ========================================
    -- ADD ONS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (tea_tradition_cafe_id, 'Honey', 'Natural honey', 10, 'Add Ons', true),
    (tea_tradition_cafe_id, 'Kullhad', 'Traditional clay cup', 10, 'Add Ons', true);

    -- ========================================
    -- CHAI PE CHARCHA (SNACKS)
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (tea_tradition_cafe_id, 'Poha', 'Flattened rice snack', 60, 'Chai Pe Charcha', true),
    (tea_tradition_cafe_id, 'Potato Wedges', 'Crispy potato wedges', 140, 'Chai Pe Charcha', true),
    (tea_tradition_cafe_id, 'French Fries', 'Classic french fries', 110, 'Chai Pe Charcha', true),
    (tea_tradition_cafe_id, 'Cheese Corn Ball', 'Cheesy corn balls', 130, 'Chai Pe Charcha', true),
    (tea_tradition_cafe_id, 'Bread Roll', 'Crispy bread rolls', 120, 'Chai Pe Charcha', true),
    (tea_tradition_cafe_id, 'Cheese Fries', 'Cheese topped fries', 140, 'Chai Pe Charcha', true),
    (tea_tradition_cafe_id, 'Peri Peri French Fries', 'Spicy peri peri fries', 140, 'Chai Pe Charcha', true),
    (tea_tradition_cafe_id, 'Hot Corn Chaat', 'Spicy corn chaat', 110, 'Chai Pe Charcha', true),
    (tea_tradition_cafe_id, 'Peri Peri Potato Wedges', 'Spicy peri peri potato wedges', 160, 'Chai Pe Charcha', true);

    -- ========================================
    -- COFFEE
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (tea_tradition_cafe_id, 'Cappuccino', 'Classic cappuccino', 80, 'Coffee', true),
    (tea_tradition_cafe_id, 'Caffe Latte', 'Smooth cafe latte', 90, 'Coffee', true),
    (tea_tradition_cafe_id, 'Cafe Americano', 'Strong Americano', 60, 'Coffee', true),
    (tea_tradition_cafe_id, 'Expresso', 'Classic espresso', 70, 'Coffee', true);

    -- ========================================
    -- BUN JA MERE
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (tea_tradition_cafe_id, 'Maska Bun', 'Buttered bun', 60, 'Bun Ja Mere', true),
    (tea_tradition_cafe_id, 'Cheese Bun Maska', 'Cheese and butter bun', 70, 'Bun Ja Mere', true),
    (tea_tradition_cafe_id, 'Cheese Chilli Bun', 'Spicy cheese chilli bun', 100, 'Bun Ja Mere', true),
    (tea_tradition_cafe_id, 'Nutella Bun', 'Nutella filled bun', 130, 'Bun Ja Mere', true);

    -- ========================================
    -- TOAST
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (tea_tradition_cafe_id, 'Bread Butter Toast', 'Simple bread butter toast', 60, 'Toast', true),
    (tea_tradition_cafe_id, 'Jam Toast', 'Sweet jam toast', 70, 'Toast', true),
    (tea_tradition_cafe_id, 'Cheese Chilli Toast', 'Spicy cheese chilli toast', 130, 'Toast', true),
    (tea_tradition_cafe_id, 'Butter Jam', 'Butter and jam toast', 90, 'Toast', true),
    (tea_tradition_cafe_id, 'Nutella Toast', 'Nutella toast', 130, 'Toast', true);

    -- ========================================
    -- SHAKES
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (tea_tradition_cafe_id, 'Vanilla Shake (Small)', 'Vanilla shake - small', 70, 'Shakes', true),
    (tea_tradition_cafe_id, 'Vanilla Shake (Large)', 'Vanilla shake - large', 90, 'Shakes', true),
    (tea_tradition_cafe_id, 'Chocolate Shake (Small)', 'Chocolate shake - small', 80, 'Shakes', true),
    (tea_tradition_cafe_id, 'Chocolate Shake (Large)', 'Chocolate shake - large', 100, 'Shakes', true),
    (tea_tradition_cafe_id, 'Strawberry Shake (Small)', 'Strawberry shake - small', 80, 'Shakes', true),
    (tea_tradition_cafe_id, 'Strawberry Shake (Large)', 'Strawberry shake - large', 100, 'Shakes', true),
    (tea_tradition_cafe_id, 'Crunchy Oreo Shake (Small)', 'Oreo shake - small', 80, 'Shakes', true),
    (tea_tradition_cafe_id, 'Crunchy Oreo Shake (Large)', 'Oreo shake - large', 100, 'Shakes', true),
    (tea_tradition_cafe_id, 'Kit Kat Shake (Small)', 'Kit Kat shake - small', 90, 'Shakes', true),
    (tea_tradition_cafe_id, 'Kit Kat Shake (Large)', 'Kit Kat shake - large', 110, 'Shakes', true),
    (tea_tradition_cafe_id, 'Peanut Butter Shake (Small)', 'Peanut butter shake - small', 90, 'Shakes', true),
    (tea_tradition_cafe_id, 'Peanut Butter Shake (Large)', 'Peanut butter shake - large', 110, 'Shakes', true),
    (tea_tradition_cafe_id, 'Nutella Shake (Small)', 'Nutella shake - small', 120, 'Shakes', true),
    (tea_tradition_cafe_id, 'Nutella Shake (Large)', 'Nutella shake - large', 140, 'Shakes', true),
    (tea_tradition_cafe_id, 'Black Current Shake (Small)', 'Black current shake - small', 90, 'Shakes', true),
    (tea_tradition_cafe_id, 'Black Current Shake (Large)', 'Black current shake - large', 110, 'Shakes', true),
    (tea_tradition_cafe_id, 'Mango Shake (Small)', 'Mango shake - small', 80, 'Shakes', true),
    (tea_tradition_cafe_id, 'Mango Shake (Large)', 'Mango shake - large', 100, 'Shakes', true),
    (tea_tradition_cafe_id, 'Bournvita Shake (Small)', 'Bournvita shake - small', 80, 'Shakes', true),
    (tea_tradition_cafe_id, 'Bournvita Shake (Large)', 'Bournvita shake - large', 100, 'Shakes', true),
    (tea_tradition_cafe_id, 'Kiwi Shake (Small)', 'Kiwi shake - small', 70, 'Shakes', true),
    (tea_tradition_cafe_id, 'Kiwi Shake (Large)', 'Kiwi shake - large', 90, 'Shakes', true),
    (tea_tradition_cafe_id, 'Caramel Dark Chocolate Shake (Small)', 'Caramel dark chocolate shake - small', 100, 'Shakes', true),
    (tea_tradition_cafe_id, 'Caramel Dark Chocolate Shake (Large)', 'Caramel dark chocolate shake - large', 120, 'Shakes', true),
    (tea_tradition_cafe_id, 'Oreo Kitkat Shake (Small)', 'Oreo KitKat shake - small', 110, 'Shakes', true),
    (tea_tradition_cafe_id, 'Oreo Kitkat Shake (Large)', 'Oreo KitKat shake - large', 130, 'Shakes', true),
    (tea_tradition_cafe_id, 'Oreo Brownie Shake (Small)', 'Oreo brownie shake - small', 110, 'Shakes', true),
    (tea_tradition_cafe_id, 'Oreo Brownie Shake (Large)', 'Oreo brownie shake - large', 140, 'Shakes', true),
    (tea_tradition_cafe_id, 'Caramel Choco Chip Shake (Small)', 'Caramel choco chip shake - small', 140, 'Shakes', true),
    (tea_tradition_cafe_id, 'Caramel Choco Chip Shake (Large)', 'Caramel choco chip shake - large', 170, 'Shakes', true),
    (tea_tradition_cafe_id, 'Chocolate Peanut Butter Shake (Small)', 'Chocolate peanut butter shake - small', 130, 'Shakes', true),
    (tea_tradition_cafe_id, 'Chocolate Peanut Butter Shake (Large)', 'Chocolate peanut butter shake - large', 150, 'Shakes', true),
    (tea_tradition_cafe_id, 'Irish Cream Milk Shake (Small)', 'Irish cream shake - small', 140, 'Shakes', true),
    (tea_tradition_cafe_id, 'Irish Cream Milk Shake (Large)', 'Irish cream shake - large', 160, 'Shakes', true),
    (tea_tradition_cafe_id, 'Strawberry Nutella Milk Shake (Small)', 'Strawberry Nutella shake - small', 150, 'Shakes', true),
    (tea_tradition_cafe_id, 'Strawberry Nutella Milk Shake (Large)', 'Strawberry Nutella shake - large', 170, 'Shakes', true),
    (tea_tradition_cafe_id, 'Butterscotch Shake (Small)', 'Butterscotch shake - small', 80, 'Shakes', true),
    (tea_tradition_cafe_id, 'Butterscotch Shake (Large)', 'Butterscotch shake - large', 100, 'Shakes', true),
    (tea_tradition_cafe_id, 'Blue Berry Shake (Small)', 'Blueberry shake - small', 90, 'Shakes', true),
    (tea_tradition_cafe_id, 'Blue Berry Shake (Large)', 'Blueberry shake - large', 110, 'Shakes', true),
    (tea_tradition_cafe_id, 'Brownie Shake (Small)', 'Brownie shake - small', 90, 'Shakes', true),
    (tea_tradition_cafe_id, 'Brownie Shake (Large)', 'Brownie shake - large', 110, 'Shakes', true);

    -- ========================================
    -- COLD COFFEE
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (tea_tradition_cafe_id, 'Cold Coffee (Small)', 'Classic cold coffee - small', 60, 'Cold Coffee', true),
    (tea_tradition_cafe_id, 'Cold Coffee (Large)', 'Classic cold coffee - large', 80, 'Cold Coffee', true),
    (tea_tradition_cafe_id, 'Cafe Frappe (Small)', 'Coffee frappe - small', 80, 'Cold Coffee', true),
    (tea_tradition_cafe_id, 'Cafe Frappe (Large)', 'Coffee frappe - large', 100, 'Cold Coffee', true),
    (tea_tradition_cafe_id, 'Oreo Cold Coffee (Small)', 'Oreo cold coffee - small', 80, 'Cold Coffee', true),
    (tea_tradition_cafe_id, 'Oreo Cold Coffee (Large)', 'Oreo cold coffee - large', 90, 'Cold Coffee', true),
    (tea_tradition_cafe_id, 'Caramel Cold Coffee (Small)', 'Caramel cold coffee - small', 90, 'Cold Coffee', true),
    (tea_tradition_cafe_id, 'Caramel Cold Coffee (Large)', 'Caramel cold coffee - large', 110, 'Cold Coffee', true),
    (tea_tradition_cafe_id, 'Hazelnut Frappe (Small)', 'Hazelnut frappe - small', 110, 'Cold Coffee', true),
    (tea_tradition_cafe_id, 'Hazelnut Frappe (Large)', 'Hazelnut frappe - large', 120, 'Cold Coffee', true),
    (tea_tradition_cafe_id, 'Brownie Cold Coffee (Small)', 'Brownie cold coffee - small', 100, 'Cold Coffee', true),
    (tea_tradition_cafe_id, 'Brownie Cold Coffee (Large)', 'Brownie cold coffee - large', 120, 'Cold Coffee', true),
    (tea_tradition_cafe_id, 'Irish Cream Cold Coffee (Small)', 'Irish cream cold coffee - small', 110, 'Cold Coffee', true),
    (tea_tradition_cafe_id, 'Irish Cream Cold Coffee (Large)', 'Irish cream cold coffee - large', 130, 'Cold Coffee', true),
    (tea_tradition_cafe_id, 'Oreo Irish Cold Coffee (Small)', 'Oreo Irish cream cold coffee - small', 130, 'Cold Coffee', true),
    (tea_tradition_cafe_id, 'Oreo Irish Cold Coffee (Large)', 'Oreo Irish cream cold coffee - large', 150, 'Cold Coffee', true);

    -- ========================================
    -- ICED TEA
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (tea_tradition_cafe_id, 'Lemon Ice Tea (Small)', 'Lemon iced tea - small', 60, 'Iced Tea', true),
    (tea_tradition_cafe_id, 'Lemon Ice Tea (Large)', 'Lemon iced tea - large', 80, 'Iced Tea', true),
    (tea_tradition_cafe_id, 'Lemon Mint Ice Tea (Small)', 'Lemon mint iced tea - small', 70, 'Iced Tea', true),
    (tea_tradition_cafe_id, 'Lemon Mint Ice Tea (Large)', 'Lemon mint iced tea - large', 90, 'Iced Tea', true),
    (tea_tradition_cafe_id, 'Apple Ice Tea (Small)', 'Apple iced tea - small', 80, 'Iced Tea', true),
    (tea_tradition_cafe_id, 'Apple Ice Tea (Large)', 'Apple iced tea - large', 90, 'Iced Tea', true),
    (tea_tradition_cafe_id, 'Litchi Ice Tea (Small)', 'Litchi iced tea - small', 80, 'Iced Tea', true),
    (tea_tradition_cafe_id, 'Litchi Ice Tea (Large)', 'Litchi iced tea - large', 90, 'Iced Tea', true),
    (tea_tradition_cafe_id, 'Cranberry Ice Tea (Small)', 'Cranberry iced tea - small', 80, 'Iced Tea', true),
    (tea_tradition_cafe_id, 'Cranberry Ice Tea (Large)', 'Cranberry iced tea - large', 90, 'Iced Tea', true),
    (tea_tradition_cafe_id, 'Peach Ice Tea (Small)', 'Peach iced tea - small', 90, 'Iced Tea', true),
    (tea_tradition_cafe_id, 'Peach Ice Tea (Large)', 'Peach iced tea - large', 100, 'Iced Tea', true),
    (tea_tradition_cafe_id, 'Mix Fruit Ice Tea (Small)', 'Mixed fruit iced tea - small', 80, 'Iced Tea', true),
    (tea_tradition_cafe_id, 'Mix Fruit Ice Tea (Large)', 'Mixed fruit iced tea - large', 90, 'Iced Tea', true),
    (tea_tradition_cafe_id, 'Orange Ice Tea (Small)', 'Orange iced tea - small', 80, 'Iced Tea', true),
    (tea_tradition_cafe_id, 'Orange Ice Tea (Large)', 'Orange iced tea - large', 90, 'Iced Tea', true),
    (tea_tradition_cafe_id, 'Green Apple Ice Tea (Small)', 'Green apple iced tea - small', 80, 'Iced Tea', true),
    (tea_tradition_cafe_id, 'Green Apple Ice Tea (Large)', 'Green apple iced tea - large', 90, 'Iced Tea', true),
    (tea_tradition_cafe_id, 'Watermelon Ice Tea (Small)', 'Watermelon iced tea - small', 80, 'Iced Tea', true),
    (tea_tradition_cafe_id, 'Watermelon Ice Tea (Large)', 'Watermelon iced tea - large', 90, 'Iced Tea', true);

    -- ========================================
    -- COOLERS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (tea_tradition_cafe_id, 'Virgin Mojito (Small)', 'Virgin mojito - small', 80, 'Coolers', true),
    (tea_tradition_cafe_id, 'Virgin Mojito (Large)', 'Virgin mojito - large', 90, 'Coolers', true),
    (tea_tradition_cafe_id, 'Strawberry Crusher (Small)', 'Strawberry crusher - small', 80, 'Coolers', true),
    (tea_tradition_cafe_id, 'Strawberry Crusher (Large)', 'Strawberry crusher - large', 100, 'Coolers', true),
    (tea_tradition_cafe_id, 'White Wonder Crusher (Small)', 'White wonder crusher - small', 80, 'Coolers', true),
    (tea_tradition_cafe_id, 'White Wonder Crusher (Large)', 'White wonder crusher - large', 100, 'Coolers', true),
    (tea_tradition_cafe_id, 'Kiwi Crusher (Small)', 'Kiwi crusher - small', 80, 'Coolers', true),
    (tea_tradition_cafe_id, 'Kiwi Crusher (Large)', 'Kiwi crusher - large', 100, 'Coolers', true),
    (tea_tradition_cafe_id, 'Black Magic Crusher (Small)', 'Black magic crusher - small', 80, 'Coolers', true),
    (tea_tradition_cafe_id, 'Black Magic Crusher (Large)', 'Black magic crusher - large', 100, 'Coolers', true),
    (tea_tradition_cafe_id, 'Summer Blue Crusher (Small)', 'Summer blue crusher - small', 80, 'Coolers', true),
    (tea_tradition_cafe_id, 'Summer Blue Crusher (Large)', 'Summer blue crusher - large', 100, 'Coolers', true),
    (tea_tradition_cafe_id, 'Green Apple Crusher (Small)', 'Green apple crusher - small', 80, 'Coolers', true),
    (tea_tradition_cafe_id, 'Green Apple Crusher (Large)', 'Green apple crusher - large', 100, 'Coolers', true);

    -- ========================================
    -- SODA SIKHANJI
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (tea_tradition_cafe_id, 'Nimboo Paani (Small)', 'Lemon water - small', 40, 'Soda Sikhanji', true),
    (tea_tradition_cafe_id, 'Nimboo Paani (Large)', 'Lemon water - large', 50, 'Soda Sikhanji', true),
    (tea_tradition_cafe_id, 'Fresh Lime Soda', 'Fresh lime soda', 70, 'Soda Sikhanji', true),
    (tea_tradition_cafe_id, 'Watermelon Soda (Small)', 'Watermelon soda - small', 80, 'Soda Sikhanji', true),
    (tea_tradition_cafe_id, 'Watermelon Soda (Large)', 'Watermelon soda - large', 100, 'Soda Sikhanji', true),
    (tea_tradition_cafe_id, 'Green Apple Soda (Small)', 'Green apple soda - small', 80, 'Soda Sikhanji', true),
    (tea_tradition_cafe_id, 'Green Apple Soda (Large)', 'Green apple soda - large', 100, 'Soda Sikhanji', true),
    (tea_tradition_cafe_id, 'Cranberry Soda', 'Cranberry soda', 90, 'Soda Sikhanji', true),
    (tea_tradition_cafe_id, 'Peach Soda (Small)', 'Peach soda - small', 90, 'Soda Sikhanji', true),
    (tea_tradition_cafe_id, 'Peach Soda (Large)', 'Peach soda - large', 100, 'Soda Sikhanji', true);

    RAISE NOTICE 'Tea Tradition cafe successfully added/updated with % menu items', (SELECT COUNT(*) FROM public.menu_items WHERE cafe_id = tea_tradition_cafe_id);
END $$;
