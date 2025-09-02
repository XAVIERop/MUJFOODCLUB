-- Add SOYA CHAAP CORNER cafe with comprehensive menu from the provided image
-- Run this script directly in your Supabase SQL Editor

DO $$
DECLARE
    soya_chaap_cafe_id UUID;
BEGIN
    -- Check if Soya Chaap Corner cafe exists, if not create it
    SELECT id INTO soya_chaap_cafe_id FROM public.cafes WHERE name = 'Soya Chaap Corner';
    
    -- If cafe doesn't exist, create it
    IF soya_chaap_cafe_id IS NULL THEN
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
            'Soya Chaap Corner',
            'Chaap & Multi-Cuisine',
            'Relish The Taste of India! Specializing in authentic soya chaap preparations, from traditional Malai and Achari to innovative Afghani and Special varieties. Our menu features chaap in multiple styles - grilled, tawa-fried, in rolls, and as part of combo meals. Experience the perfect blend of spices and flavors in every bite!',
            'Ground Floor, GHS',
            '+91-8306512244',
            '11:00 AM - 11:00 PM',
            true,
            NOW(),
            NOW()
        );
        
        -- Get the newly created cafe ID
        SELECT id INTO soya_chaap_cafe_id FROM public.cafes WHERE name = 'Soya Chaap Corner';
    END IF;
    
    -- Clear existing menu items for Soya Chaap Corner
    DELETE FROM public.menu_items WHERE cafe_id = soya_chaap_cafe_id;
    
    -- ========================================
    -- CHAAP - HALF/FULL PORTIONS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (soya_chaap_cafe_id, 'Malai Chaap (Half)', 'Creamy malai chaap - half portion', 160, 'Chaap - Half', true),
    (soya_chaap_cafe_id, 'Malai Chaap (Full)', 'Creamy malai chaap - full portion', 220, 'Chaap - Full', true),
    (soya_chaap_cafe_id, 'Achari Chaap (Half)', 'Pickle flavored chaap - half portion', 160, 'Chaap - Half', true),
    (soya_chaap_cafe_id, 'Achari Chaap (Full)', 'Pickle flavored chaap - full portion', 220, 'Chaap - Full', true),
    (soya_chaap_cafe_id, 'Haryali Chaap (Half)', 'Green herb chaap - half portion', 160, 'Chaap - Half', true),
    (soya_chaap_cafe_id, 'Haryali Chaap (Full)', 'Green herb chaap - full portion', 220, 'Chaap - Full', true),
    (soya_chaap_cafe_id, 'Lemon Chaap (Half)', 'Tangy lemon chaap - half portion', 160, 'Chaap - Half', true),
    (soya_chaap_cafe_id, 'Lemon Chaap (Full)', 'Tangy lemon chaap - full portion', 220, 'Chaap - Full', true),
    (soya_chaap_cafe_id, 'Masala Chaap (Half)', 'Spicy masala chaap - half portion', 160, 'Chaap - Half', true),
    (soya_chaap_cafe_id, 'Masala Chaap (Full)', 'Spicy masala chaap - full portion', 220, 'Chaap - Full', true),
    (soya_chaap_cafe_id, 'Fried Chaap (Half)', 'Crispy fried chaap - half portion', 160, 'Chaap - Half', true),
    (soya_chaap_cafe_id, 'Fried Chaap (Full)', 'Crispy fried chaap - full portion', 220, 'Chaap - Full', true),
    (soya_chaap_cafe_id, 'Garlic Chaap (Half)', 'Garlic flavored chaap - half portion', 170, 'Chaap - Half', true),
    (soya_chaap_cafe_id, 'Garlic Chaap (Full)', 'Garlic flavored chaap - full portion', 230, 'Chaap - Full', true),
    (soya_chaap_cafe_id, 'Pudina Chaap (Half)', 'Mint flavored chaap - half portion', 170, 'Chaap - Half', true),
    (soya_chaap_cafe_id, 'Pudina Chaap (Full)', 'Mint flavored chaap - full portion', 230, 'Chaap - Full', true),
    (soya_chaap_cafe_id, 'Afghani Chaap (Half)', 'Afghani style chaap - half portion', 170, 'Chaap - Half', true),
    (soya_chaap_cafe_id, 'Afghani Chaap (Full)', 'Afghani style chaap - full portion', 240, 'Chaap - Full', true),
    (soya_chaap_cafe_id, 'Afghani Stuff Chaap (Half)', 'Stuffed Afghani chaap - half portion', 180, 'Chaap - Half', true),
    (soya_chaap_cafe_id, 'Afghani Stuff Chaap (Full)', 'Stuffed Afghani chaap - full portion', 240, 'Chaap - Full', true),
    (soya_chaap_cafe_id, 'Malai Tikka Chaap (Half)', 'Malai tikka style chaap - half portion', 180, 'Chaap - Half', true),
    (soya_chaap_cafe_id, 'Malai Tikka Chaap (Full)', 'Malai tikka style chaap - full portion', 240, 'Chaap - Full', true),
    (soya_chaap_cafe_id, 'Masala Tikka Chaap (Half)', 'Masala tikka style chaap - half portion', 180, 'Chaap - Half', true),
    (soya_chaap_cafe_id, 'Masala Tikka Chaap (Full)', 'Masala tikka style chaap - full portion', 240, 'Chaap - Full', true),
    (soya_chaap_cafe_id, 'Punjabi Chaap (Half)', 'Punjabi style chaap - half portion', 180, 'Chaap - Half', true),
    (soya_chaap_cafe_id, 'Punjabi Chaap (Full)', 'Punjabi style chaap - full portion', 240, 'Chaap - Full', true),
    (soya_chaap_cafe_id, 'Mushroom Tikka Chaap (Half)', 'Mushroom tikka style chaap - half portion', 200, 'Chaap - Half', true),
    (soya_chaap_cafe_id, 'Mushroom Tikka Chaap (Full)', 'Mushroom tikka style chaap - full portion', 290, 'Chaap - Full', true),
    (soya_chaap_cafe_id, 'Special Chaap (Half)', 'Special preparation chaap - half portion', 200, 'Chaap - Half', true),
    (soya_chaap_cafe_id, 'Special Chaap (Full)', 'Special preparation chaap - full portion', 290, 'Chaap - Full', true),
    (soya_chaap_cafe_id, 'Dry Fruit Chaap (Half)', 'Dry fruit chaap - half portion', 200, 'Chaap - Half', true),
    (soya_chaap_cafe_id, 'Dry Fruit Chaap (Full)', 'Dry fruit chaap - full portion', 310, 'Chaap - Full', true);

    -- ========================================
    -- SPECIAL CHAAP
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (soya_chaap_cafe_id, 'KFC Chaap', 'KFC style special chaap preparation', 300, 'Special Chaap', true),
    (soya_chaap_cafe_id, 'Lilipop Chaap', 'Lollipop style chaap', 290, 'Special Chaap', true),
    (soya_chaap_cafe_id, 'Dahi Kabab', 'Yogurt based kabab', 250, 'Special Chaap', true);

    -- ========================================
    -- ROLL - HALF/FULL PORTIONS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (soya_chaap_cafe_id, 'Achari Chaap Roll (Half)', 'Pickle flavored chaap roll - half portion', 190, 'Roll - Half', true),
    (soya_chaap_cafe_id, 'Achari Chaap Roll (Full)', 'Pickle flavored chaap roll - full portion', 290, 'Roll - Full', true),
    (soya_chaap_cafe_id, 'Malai Chaap Roll (Half)', 'Creamy malai chaap roll - half portion', 190, 'Roll - Half', true),
    (soya_chaap_cafe_id, 'Malai Chaap Roll (Full)', 'Creamy malai chaap roll - full portion', 290, 'Roll - Full', true),
    (soya_chaap_cafe_id, 'Masala Chaap Roll (Half)', 'Spicy masala chaap roll - half portion', 190, 'Roll - Half', true),
    (soya_chaap_cafe_id, 'Masala Chaap Roll (Full)', 'Spicy masala chaap roll - full portion', 290, 'Roll - Full', true),
    (soya_chaap_cafe_id, 'Punjabi Chaap Roll (Half)', 'Punjabi style chaap roll - half portion', 190, 'Roll - Half', true),
    (soya_chaap_cafe_id, 'Punjabi Chaap Roll (Full)', 'Punjabi style chaap roll - full portion', 290, 'Roll - Full', true),
    (soya_chaap_cafe_id, 'Lemon Chaap Roll (Half)', 'Tangy lemon chaap roll - half portion', 190, 'Roll - Half', true),
    (soya_chaap_cafe_id, 'Lemon Chaap Roll (Full)', 'Tangy lemon chaap roll - full portion', 290, 'Roll - Full', true),
    (soya_chaap_cafe_id, 'Pudina Chaap Roll (Half)', 'Mint flavored chaap roll - half portion', 190, 'Roll - Half', true),
    (soya_chaap_cafe_id, 'Pudina Chaap Roll (Full)', 'Mint flavored chaap roll - full portion', 290, 'Roll - Full', true),
    (soya_chaap_cafe_id, 'Special Chaap Roll (Half)', 'Special chaap roll - half portion', 210, 'Roll - Half', true),
    (soya_chaap_cafe_id, 'Special Chaap Roll (Full)', 'Special chaap roll - full portion', 310, 'Roll - Full', true);

    -- ========================================
    -- ROTI
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (soya_chaap_cafe_id, 'Rumali Roti', 'Thin rumali roti', 15, 'Roti', true),
    (soya_chaap_cafe_id, 'Tandoori Roti', 'Classic tandoori roti', 15, 'Roti', true),
    (soya_chaap_cafe_id, 'Rumali Roti Butter', 'Buttered rumali roti', 20, 'Roti', true);

    -- ========================================
    -- PANEER - HALF/FULL PORTIONS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (soya_chaap_cafe_id, 'Paneer Tikka (Half)', 'Classic paneer tikka - half portion', 180, 'Paneer - Half', true),
    (soya_chaap_cafe_id, 'Paneer Tikka (Full)', 'Classic paneer tikka - full portion', 240, 'Paneer - Full', true),
    (soya_chaap_cafe_id, 'Malai Paneer Tikka (Half)', 'Creamy malai paneer tikka - half portion', 180, 'Paneer - Half', true),
    (soya_chaap_cafe_id, 'Malai Paneer Tikka (Full)', 'Creamy malai paneer tikka - full portion', 240, 'Paneer - Full', true),
    (soya_chaap_cafe_id, 'Achari Paneer Tikka (Half)', 'Pickle flavored paneer tikka - half portion', 180, 'Paneer - Half', true),
    (soya_chaap_cafe_id, 'Achari Paneer Tikka (Full)', 'Pickle flavored paneer tikka - full portion', 240, 'Paneer - Full', true),
    (soya_chaap_cafe_id, 'Lemon Paneer Tikka (Half)', 'Tangy lemon paneer tikka - half portion', 180, 'Paneer - Half', true),
    (soya_chaap_cafe_id, 'Lemon Paneer Tikka (Full)', 'Tangy lemon paneer tikka - full portion', 240, 'Paneer - Full', true),
    (soya_chaap_cafe_id, 'Special Paneer Tikka (Half)', 'Special paneer tikka - half portion', 200, 'Paneer - Half', true),
    (soya_chaap_cafe_id, 'Special Paneer Tikka (Full)', 'Special paneer tikka - full portion', 280, 'Paneer - Full', true);

    -- ========================================
    -- TAWA SE GRAVY - HALF/FULL PORTIONS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (soya_chaap_cafe_id, 'Tawa Chaap (Half)', 'Tawa fried chaap - half portion', 180, 'Tawa Se Gravy - Half', true),
    (soya_chaap_cafe_id, 'Tawa Chaap (Full)', 'Tawa fried chaap - full portion', 270, 'Tawa Se Gravy - Full', true),
    (soya_chaap_cafe_id, 'Tawa Paneer (Half)', 'Tawa fried paneer - half portion', 190, 'Tawa Se Gravy - Half', true),
    (soya_chaap_cafe_id, 'Tawa Paneer (Full)', 'Tawa fried paneer - full portion', 280, 'Tawa Se Gravy - Full', true),
    (soya_chaap_cafe_id, 'Tawa Mushroom (Half)', 'Tawa fried mushroom - half portion', 200, 'Tawa Se Gravy - Half', true),
    (soya_chaap_cafe_id, 'Tawa Mushroom (Full)', 'Tawa fried mushroom - full portion', 290, 'Tawa Se Gravy - Full', true),
    (soya_chaap_cafe_id, 'Veg Masala Kaleji (Half)', 'Spicy vegetable liver masala - half portion', 180, 'Tawa Se Gravy - Half', true),
    (soya_chaap_cafe_id, 'Veg Masala Kaleji (Full)', 'Spicy vegetable liver masala - full portion', 270, 'Tawa Se Gravy - Full', true),
    (soya_chaap_cafe_id, 'Shahi Chaap (Half)', 'Royal shahi chaap - half portion', 200, 'Tawa Se Gravy - Half', true),
    (soya_chaap_cafe_id, 'Shahi Chaap (Full)', 'Royal shahi chaap - full portion', 290, 'Tawa Se Gravy - Full', true),
    (soya_chaap_cafe_id, 'Chaap TakaTAK (Half)', 'Spicy chaap takaTAK - half portion', 210, 'Tawa Se Gravy - Half', true),
    (soya_chaap_cafe_id, 'Chaap TakaTAK (Full)', 'Spicy chaap takaTAK - full portion', 310, 'Tawa Se Gravy - Full', true),
    (soya_chaap_cafe_id, 'Butter Chaap (Half)', 'Buttery chaap - half portion', 210, 'Tawa Se Gravy - Half', true),
    (soya_chaap_cafe_id, 'Butter Chaap (Full)', 'Buttery chaap - full portion', 310, 'Tawa Se Gravy - Full', true);

    -- ========================================
    -- COMBO MEAL
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (soya_chaap_cafe_id, 'Dal Tadka + 2 Tandoori Roti Combo', 'Dal tadka with 2 tandoori rotis', 150, 'Combo Meal', true),
    (soya_chaap_cafe_id, 'Paneer Butter Masala + 2 Tandoori Roti', 'Paneer butter masala with 2 tandoori rotis', 180, 'Combo Meal', true);

    -- ========================================
    -- BIRYANI
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (soya_chaap_cafe_id, 'Soya Chap Biryani', 'Fragrant soya chaap biryani', 200, 'Biryani', true),
    (soya_chaap_cafe_id, 'Paneer Biryani', 'Delicious paneer biryani', 220, 'Biryani', true);

    -- ========================================
    -- MOMOS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (soya_chaap_cafe_id, 'Fried Momos 6 Pcs', 'Crispy fried momos - 6 pieces', 120, 'Momos', true),
    (soya_chaap_cafe_id, 'Tandoori Momos 6pcs', 'Tandoori style momos - 6 pieces', 140, 'Momos', true),
    (soya_chaap_cafe_id, 'KFC Momos 6 Pcs', 'KFC style momos - 6 pieces', 160, 'Momos', true),
    (soya_chaap_cafe_id, 'Afghani / Aachari Momos 6pcs', 'Afghani or Aachari style momos - 6 pieces', 160, 'Momos', true);

    RAISE NOTICE 'Soya Chaap Corner cafe successfully added/updated with % menu items', (SELECT COUNT(*) FROM public.menu_items WHERE cafe_id = soya_chaap_cafe_id);
END $$;
