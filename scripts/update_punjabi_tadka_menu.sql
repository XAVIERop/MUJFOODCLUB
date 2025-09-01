-- Update Punjabi Tadka cafe menu with comprehensive menu from the provided images
-- Run this script directly in your Supabase SQL Editor

DO $$
DECLARE
    punjabi_tadka_cafe_id UUID;
BEGIN
    -- Get the Punjabi Tadka cafe ID
    SELECT id INTO punjabi_tadka_cafe_id FROM public.cafes WHERE name = 'Punjabi Tadka';
    
    -- If cafe doesn't exist, create it
    IF punjabi_tadka_cafe_id IS NULL THEN
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
            'Punjabi Tadka',
            'North Indian',
            'Authentic Punjabi cuisine with a modern twist. From crispy starters to rich curries, tandoori specialties to wholesome combos - we bring you the authentic taste of Punjab. Specializing in chaap, tandoori items, and traditional Punjabi delicacies.',
            'G-1, Ground Floor, GHS',
            '+91-9001282566',
            '11:00 AM - 11:00 PM',
            true,
            NOW(),
            NOW()
        );
        
        -- Get the newly created cafe ID
        SELECT id INTO punjabi_tadka_cafe_id FROM public.cafes WHERE name = 'Punjabi Tadka';
    END IF;
    
    -- Clear existing menu items for Punjabi Tadka
    DELETE FROM public.menu_items WHERE cafe_id = punjabi_tadka_cafe_id;
    
    -- ========================================
    -- SALAD & RAITA
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (punjabi_tadka_cafe_id, 'Green Salad', 'Fresh mixed green salad', 70, 'Salad & Raita', true),
    (punjabi_tadka_cafe_id, 'Boondi Raita', 'Boondi raita with spices', 90, 'Salad & Raita', true),
    (punjabi_tadka_cafe_id, 'Mix Raita', 'Mixed vegetable raita', 90, 'Salad & Raita', true),
    (punjabi_tadka_cafe_id, 'Dahi Fry', 'Fried yogurt preparation', 110, 'Salad & Raita', true);

    -- ========================================
    -- PANEER TIKKA
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (punjabi_tadka_cafe_id, 'Paneer Tikka (Half)', 'Marinated paneer grilled to perfection - half portion', 190, 'Paneer Tikka', true),
    (punjabi_tadka_cafe_id, 'Paneer Tikka (Full)', 'Marinated paneer grilled to perfection - full portion', 270, 'Paneer Tikka', true);

    -- ========================================
    -- PANEER MALAI TIKKA
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (punjabi_tadka_cafe_id, 'Paneer Malai Tikka (Half)', 'Creamy malai paneer tikka - half portion', 220, 'Paneer Malai Tikka', true),
    (punjabi_tadka_cafe_id, 'Paneer Malai Tikka (Full)', 'Creamy malai paneer tikka - full portion', 280, 'Paneer Malai Tikka', true);

    -- ========================================
    -- HARA BHARA KABAB
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (punjabi_tadka_cafe_id, 'Hara Bhara Kabab (Half)', 'Fresh green vegetable kababs - half portion', 160, 'Hara Bhara Kabab', true),
    (punjabi_tadka_cafe_id, 'Hara Bhara Kabab (Full)', 'Fresh green vegetable kababs - full portion', 280, 'Hara Bhara Kabab', true);

    -- ========================================
    -- MAIN COURSE - DAL SECTION
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (punjabi_tadka_cafe_id, 'Dal Tadka', 'Tempered yellow dal with spices', 160, 'Main Course - Dal', true),
    (punjabi_tadka_cafe_id, 'Dal Makhani', 'Rich and creamy black dal', 220, 'Main Course - Dal', true),
    (punjabi_tadka_cafe_id, 'Mix Veg', 'Mixed vegetable curry', 200, 'Main Course - Dal', true);

    -- ========================================
    -- MAIN COURSE - PANEER & CURRIES
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (punjabi_tadka_cafe_id, 'Paneer Lavabdar', 'Paneer in rich tomato gravy', 200, 'Main Course - Paneer & Curries', true),
    (punjabi_tadka_cafe_id, 'Kaju Curry', 'Cashew nut curry', 200, 'Main Course - Paneer & Curries', true),
    (punjabi_tadka_cafe_id, 'Mashroom Masala', 'Mushroom masala curry', 250, 'Main Course - Paneer & Curries', true),
    (punjabi_tadka_cafe_id, 'Rajma Masala', 'Kidney beans curry', 270, 'Main Course - Paneer & Curries', true);

    -- ========================================
    -- MAIN COURSE - SPECIAL DISHES
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (punjabi_tadka_cafe_id, 'Malai Kofta Pindi', 'Creamy kofta in rich gravy', 280, 'Main Course - Special Dishes', true),
    (punjabi_tadka_cafe_id, 'Chole/Chana Masala', 'Chickpea curry with spices', 320, 'Main Course - Special Dishes', true),
    (punjabi_tadka_cafe_id, 'Kadai Paneer', 'Paneer in kadai style', 220, 'Main Course - Special Dishes', true),
    (punjabi_tadka_cafe_id, 'Paneer Butter Masala', 'Paneer in rich butter gravy', 230, 'Main Course - Special Dishes', true);

    -- ========================================
    -- TANDOOR - BASIC ROTIS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (punjabi_tadka_cafe_id, 'Plain Roti', 'Basic wheat roti', 12, 'Tandoor - Basic Rotis', true),
    (punjabi_tadka_cafe_id, 'Butter Roti', 'Butter topped roti', 15, 'Tandoor - Basic Rotis', true),
    (punjabi_tadka_cafe_id, 'Laccha Paratha Plain', 'Layered plain paratha', 45, 'Tandoor - Basic Rotis', true),
    (punjabi_tadka_cafe_id, 'Laccha Paratha Butter', 'Layered butter paratha', 55, 'Tandoor - Basic Rotis', true);

    -- ========================================
    -- TANDOOR - NAAN VARIETIES
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (punjabi_tadka_cafe_id, 'Naan Plain', 'Basic naan bread', 60, 'Tandoor - Naan Varieties', true),
    (punjabi_tadka_cafe_id, 'Naan Butter', 'Butter naan', 65, 'Tandoor - Naan Varieties', true),
    (punjabi_tadka_cafe_id, 'Garlic Naan', 'Garlic flavored naan', 70, 'Tandoor - Naan Varieties', true),
    (punjabi_tadka_cafe_id, 'Cheese Garlic Naan', 'Cheese and garlic naan', 90, 'Tandoor - Naan Varieties', true),
    (punjabi_tadka_cafe_id, 'Chur-Chur Naan', 'Crumbled style naan', 80, 'Tandoor - Naan Varieties', true);

    -- ========================================
    -- TANDOOR - PARATHA VARIETIES
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (punjabi_tadka_cafe_id, 'Tandoori Paratha', 'Tandoor baked paratha', 70, 'Tandoor - Paratha Varieties', true),
    (punjabi_tadka_cafe_id, 'Aloo Pyaj Paratha', 'Potato and onion stuffed paratha', 70, 'Tandoor - Paratha Varieties', true),
    (punjabi_tadka_cafe_id, 'Paneer Paratha', 'Paneer stuffed paratha', 90, 'Tandoor - Paratha Varieties', true),
    (punjabi_tadka_cafe_id, 'Mix Paratha', 'Mixed vegetable paratha', 85, 'Tandoor - Paratha Varieties', true),
    (punjabi_tadka_cafe_id, 'Cheese Paneer Paratha', 'Cheese and paneer paratha', 90, 'Tandoor - Paratha Varieties', true);

    -- ========================================
    -- TANDOOR - KULCHA & SPECIAL ROTIS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (punjabi_tadka_cafe_id, 'Amritsari Kulcha', 'Amritsari style kulcha', 90, 'Tandoor - Kulcha & Special Rotis', true),
    (punjabi_tadka_cafe_id, 'Stuffed Kulcha', 'Stuffed kulcha bread', 80, 'Tandoor - Kulcha & Special Rotis', true),
    (punjabi_tadka_cafe_id, 'Laccha Paratha', 'Layered paratha', 90, 'Tandoor - Kulcha & Special Rotis', true),
    (punjabi_tadka_cafe_id, 'Pudina Paratha', 'Mint flavored paratha', 90, 'Tandoor - Kulcha & Special Rotis', true),
    (punjabi_tadka_cafe_id, 'Rumali Roti', 'Thin rumali roti', 15, 'Tandoor - Kulcha & Special Rotis', true),
    (punjabi_tadka_cafe_id, 'Butter Rumali Roti', 'Butter topped rumali roti', 25, 'Tandoor - Kulcha & Special Rotis', true);

    -- ========================================
    -- CHAAP - TANDOORI VARIETIES
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (punjabi_tadka_cafe_id, 'Tandoori Chaap (Half)', 'Tandoori style soya chaap - half portion', 170, 'Chaap - Tandoori Varieties', true),
    (punjabi_tadka_cafe_id, 'Tandoori Chaap (Full)', 'Tandoori style soya chaap - full portion', 230, 'Chaap - Tandoori Varieties', true),
    (punjabi_tadka_cafe_id, 'Peri-Peri Soya Chaap (Half)', 'Spicy peri-peri soya chaap - half portion', 180, 'Chaap - Tandoori Varieties', true),
    (punjabi_tadka_cafe_id, 'Peri-Peri Soya Chaap (Full)', 'Spicy peri-peri soya chaap - full portion', 240, 'Chaap - Tandoori Varieties', true),
    (punjabi_tadka_cafe_id, 'Garlic Masala Chaap (Half)', 'Garlic masala soya chaap - half portion', 190, 'Chaap - Tandoori Varieties', true),
    (punjabi_tadka_cafe_id, 'Garlic Masala Chaap (Full)', 'Garlic masala soya chaap - full portion', 250, 'Chaap - Tandoori Varieties', true),
    (punjabi_tadka_cafe_id, 'Soya Chaap Lolly Pop (4P)', 'Soya chaap lolly pop - 4 pieces', 280, 'Chaap - Tandoori Varieties', true);

    -- ========================================
    -- CHAAP - MALAI VARIETIES
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (punjabi_tadka_cafe_id, 'Malai Chaap (Half)', 'Creamy malai soya chaap - half portion', 170, 'Chaap - Malai Varieties', true),
    (punjabi_tadka_cafe_id, 'Malai Chaap (Full)', 'Creamy malai soya chaap - full portion', 230, 'Chaap - Malai Varieties', true),
    (punjabi_tadka_cafe_id, 'Afghani Chaap (Half)', 'Afghani style soya chaap - half portion', 180, 'Chaap - Malai Varieties', true),
    (punjabi_tadka_cafe_id, 'Afghani Chaap (Full)', 'Afghani style soya chaap - full portion', 240, 'Chaap - Malai Varieties', true),
    (punjabi_tadka_cafe_id, 'Aachari Chaap (Half)', 'Pickle flavored soya chaap - half portion', 170, 'Chaap - Malai Varieties', true),
    (punjabi_tadka_cafe_id, 'Aachari Chaap (Full)', 'Pickle flavored soya chaap - full portion', 230, 'Chaap - Malai Varieties', true),
    (punjabi_tadka_cafe_id, 'Pudina Chaap (Half)', 'Mint flavored soya chaap - half portion', 180, 'Chaap - Malai Varieties', true),
    (punjabi_tadka_cafe_id, 'Pudina Chaap (Full)', 'Mint flavored soya chaap - full portion', 240, 'Chaap - Malai Varieties', true);

    -- ========================================
    -- CHAAP - GRAVY VARIETIES
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (punjabi_tadka_cafe_id, 'Tawa Chaap (Half)', 'Tawa style soya chaap - half portion', 220, 'Chaap - Gravy Varieties', true),
    (punjabi_tadka_cafe_id, 'Tawa Chaap (Full)', 'Tawa style soya chaap - full portion', 340, 'Chaap - Gravy Varieties', true),
    (punjabi_tadka_cafe_id, 'Chaap Gravy (Half)', 'Soya chaap in rich gravy - half portion', 220, 'Chaap - Gravy Varieties', true),
    (punjabi_tadka_cafe_id, 'Chaap Gravy (Full)', 'Soya chaap in rich gravy - full portion', 320, 'Chaap - Gravy Varieties', true),
    (punjabi_tadka_cafe_id, 'Handi Chaap (Half)', 'Handi style soya chaap - half portion', 220, 'Chaap - Gravy Varieties', true),
    (punjabi_tadka_cafe_id, 'Handi Chaap (Full)', 'Handi style soya chaap - full portion', 340, 'Chaap - Gravy Varieties', true),
    (punjabi_tadka_cafe_id, 'Keema Chaap (Half)', 'Minced style soya chaap - half portion', 220, 'Chaap - Gravy Varieties', true),
    (punjabi_tadka_cafe_id, 'Keema Chaap (Full)', 'Minced style soya chaap - full portion', 340, 'Chaap - Gravy Varieties', true),
    (punjabi_tadka_cafe_id, 'Punjabi Tadka Chaap', 'Punjabi style soya chaap', 220, 'Chaap - Gravy Varieties', true),
    (punjabi_tadka_cafe_id, 'Special Chaap (Half)', 'Special soya chaap - half portion', 240, 'Chaap - Gravy Varieties', true),
    (punjabi_tadka_cafe_id, 'Special Chaap (Full)', 'Special soya chaap - full portion', 360, 'Chaap - Gravy Varieties', true);

    -- ========================================
    -- COMBO MEALS - BASIC COMBOS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (punjabi_tadka_cafe_id, 'Dal Tadka Combo', 'Dal Tadka + Rice + Tandoori Roti(2) + Pickle + Salad + Chaach', 140, 'Combo Meals - Basic Combos', true),
    (punjabi_tadka_cafe_id, 'Dal Makhani Combo', 'Dal Makhani + Rice + Tandoori Roti(2) + Pickle + Salad + Chaach', 160, 'Combo Meals - Basic Combos', true),
    (punjabi_tadka_cafe_id, 'Paneer Butter Masala Combo', 'Paneer Butter Masala + Rice + Tandoori Roti(2) + Pickle + Salad + Chaach', 190, 'Combo Meals - Basic Combos', true),
    (punjabi_tadka_cafe_id, 'Mix Veg Combo', 'Mix Veg + Rice + Tandoori Roti(2) + Pickle + Salad + Chaach', 180, 'Combo Meals - Basic Combos', true);

    -- ========================================
    -- COMBO MEALS - PREMIUM COMBOS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (punjabi_tadka_cafe_id, 'Dal Makhani Premium Combo', 'Dal Makhani + Laccha Paratha(2)/Butter Naan(2) + Pickle/Salad + Chaach', 199, 'Combo Meals - Premium Combos', true),
    (punjabi_tadka_cafe_id, 'Paneer Butter Masala Premium Combo', 'Paneer Butter Masala + Laccha Paratha(2)/Butter Naan(2) + Pickle/Salad + Chaach', 219, 'Combo Meals - Premium Combos', true),
    (punjabi_tadka_cafe_id, 'Mix Veg Premium Combo', 'Mix Veg + Laccha Paratha(2)/Butter Naan(2) + Pickle/Salad + Chaach', 209, 'Combo Meals - Premium Combos', true);

    -- ========================================
    -- COMBO MEALS - SPECIAL COMBOS
    -- ========================================
    INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available) VALUES
    (punjabi_tadka_cafe_id, 'Pindi Chole Combo', 'Pindi Chole + Chur Chur Naan/Amritsari Kulcha + Salad/Pickle + Chaach', 229, 'Combo Meals - Special Combos', true),
    (punjabi_tadka_cafe_id, 'Dal Tadka Special Combo', 'Dal Tadka + Mix Veg + Laccha Paratha(2)/Butter Naan(2) + Salad/Pickle + Chaach', 250, 'Combo Meals - Special Combos', true),
    (punjabi_tadka_cafe_id, 'Dal Makhani Special Combo', 'Dal Makhani + Paneer Butter Masala + Laccha Paratha(2)/Butter Naan(2) + Salad/Pickle + Chaach', 280, 'Combo Meals - Special Combos', true);

    RAISE NOTICE 'Punjabi Tadka cafe menu successfully updated with % menu items', (SELECT COUNT(*) FROM public.menu_items WHERE cafe_id = punjabi_tadka_cafe_id);
END $$;
