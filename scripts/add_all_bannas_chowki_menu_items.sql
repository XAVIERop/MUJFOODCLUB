-- Add all menu items to Banna's Chowki cafe
-- This script adds all items from the menu images provided
-- Run this in Supabase Dashboard → SQL Editor

-- Step 1: Find Banna's Chowki cafe ID
DO $$
DECLARE
    bannas_chowki_cafe_id UUID;
    items_added INTEGER := 0;
BEGIN
    -- Get Banna's Chowki cafe ID
    SELECT id INTO bannas_chowki_cafe_id 
    FROM cafes 
    WHERE slug = 'bannas-chowki' OR name ILIKE '%banna%chowki%';
    
    IF bannas_chowki_cafe_id IS NULL THEN
        RAISE EXCEPTION 'Banna''s Chowki cafe not found';
    END IF;
    
    RAISE NOTICE 'Adding menu items to Banna''s Chowki (Cafe ID: %)', bannas_chowki_cafe_id;
    
    -- ========================================
    -- MEAL FOR 2 (MUTTON) - with Tandoori Roti (2) and with Naan (2)
    -- ========================================
    
    INSERT INTO menu_items (cafe_id, name, description, price, category, is_available, out_of_stock, is_vegetarian, preparation_time)
    VALUES
    -- Lal Maas
    (bannas_chowki_cafe_id, 'Lal Maas with Tandoori Roti (2)', 'Spicy red mutton curry with 2 Tandoori Roti', 199, 'Meal for 2 (Mutton)', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Lal Maas with Naan (2)', 'Spicy red mutton curry with 2 Naan', 219, 'Meal for 2 (Mutton)', true, false, false, 20),
    
    -- Handi Mutton
    (bannas_chowki_cafe_id, 'Handi Mutton with Tandoori Roti (2)', 'Mutton cooked in handi with 2 Tandoori Roti', 199, 'Meal for 2 (Mutton)', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Handi Mutton with Naan (2)', 'Mutton cooked in handi with 2 Naan', 219, 'Meal for 2 (Mutton)', true, false, false, 20),
    
    -- Mutton Curry
    (bannas_chowki_cafe_id, 'Mutton Curry with Tandoori Roti (2)', 'Traditional mutton curry with 2 Tandoori Roti', 199, 'Meal for 2 (Mutton)', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Mutton Curry with Naan (2)', 'Traditional mutton curry with 2 Naan', 219, 'Meal for 2 (Mutton)', true, false, false, 20),
    
    -- Keema Kaleji
    (bannas_chowki_cafe_id, 'Keema Kaleji with Tandoori Roti (2)', 'Mutton mince and liver curry with 2 Tandoori Roti', 199, 'Meal for 2 (Mutton)', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Keema Kaleji with Naan (2)', 'Mutton mince and liver curry with 2 Naan', 219, 'Meal for 2 (Mutton)', true, false, false, 20),
    
    -- Kashmiri Mutton
    (bannas_chowki_cafe_id, 'Kashmiri Mutton with Tandoori Roti (2)', 'Kashmiri style mutton curry with 2 Tandoori Roti', 199, 'Meal for 2 (Mutton)', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Kashmiri Mutton with Naan (2)', 'Kashmiri style mutton curry with 2 Naan', 219, 'Meal for 2 (Mutton)', true, false, false, 20),
    
    -- Mutton Seekh Kebab
    (bannas_chowki_cafe_id, 'Mutton Seekh Kebab with Tandoori Roti (2)', 'Grilled mutton seekh kebab with 2 Tandoori Roti', 199, 'Meal for 2 (Mutton)', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Mutton Seekh Kebab with Naan (2)', 'Grilled mutton seekh kebab with 2 Naan', 219, 'Meal for 2 (Mutton)', true, false, false, 20),
    
    -- Chowki's Special Mutton
    (bannas_chowki_cafe_id, 'Chowki''s Special Mutton with Tandoori Roti (2)', 'House special mutton curry with 2 Tandoori Roti', 199, 'Meal for 2 (Mutton)', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Chowki''s Special Mutton with Naan (2)', 'House special mutton curry with 2 Naan', 219, 'Meal for 2 (Mutton)', true, false, false, 20),
    
    -- Mutton Rogan-Josh
    (bannas_chowki_cafe_id, 'Mutton Rogan-Josh with Tandoori Roti (2)', 'Classic mutton rogan josh with 2 Tandoori Roti', 199, 'Meal for 2 (Mutton)', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Mutton Rogan-Josh with Naan (2)', 'Classic mutton rogan josh with 2 Naan', 219, 'Meal for 2 (Mutton)', true, false, false, 20);
    
    GET DIAGNOSTICS items_added = ROW_COUNT;
    RAISE NOTICE 'Added % Meal for 2 (Mutton) items', items_added;
    
    -- ========================================
    -- MURG MEHAK E ZAIKA (CHICKEN) - Half and Full portions
    -- ========================================
    
    INSERT INTO menu_items (cafe_id, name, description, price, category, is_available, out_of_stock, is_vegetarian, preparation_time)
    VALUES
    (bannas_chowki_cafe_id, 'Butter Chicken (Half)', 'Creamy butter chicken - Half portion', 349, 'Murg Mehak e Zaika', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Butter Chicken (Full)', 'Creamy butter chicken - Full portion', 549, 'Murg Mehak e Zaika', true, false, false, 20),
    
    (bannas_chowki_cafe_id, 'Tawa Chicken (Half)', 'Tawa cooked chicken - Half portion', 299, 'Murg Mehak e Zaika', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Tawa Chicken (Full)', 'Tawa cooked chicken - Full portion', 499, 'Murg Mehak e Zaika', true, false, false, 20),
    
    (bannas_chowki_cafe_id, 'Chicken Curry (Half)', 'Traditional chicken curry - Half portion', 299, 'Murg Mehak e Zaika', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Chicken Curry (Full)', 'Traditional chicken curry - Full portion', 449, 'Murg Mehak e Zaika', true, false, false, 20),
    
    (bannas_chowki_cafe_id, 'Chicken Tikka Masala (Half)', 'Tandoori chicken in creamy masala - Half portion', 329, 'Murg Mehak e Zaika', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Chicken Tikka Masala (Full)', 'Tandoori chicken in creamy masala - Full portion', 329, 'Murg Mehak e Zaika', true, false, false, 20),
    
    (bannas_chowki_cafe_id, 'Handi Chicken (Half)', 'Chicken cooked in handi - Half portion', 319, 'Murg Mehak e Zaika', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Handi Chicken (Full)', 'Chicken cooked in handi - Full portion', 419, 'Murg Mehak e Zaika', true, false, false, 20),
    
    (bannas_chowki_cafe_id, 'Noor-e-Kali Mirch (Half)', 'Chicken in black pepper sauce - Half portion', 339, 'Murg Mehak e Zaika', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Noor-e-Kali Mirch (Full)', 'Chicken in black pepper sauce - Full portion', 439, 'Murg Mehak e Zaika', true, false, false, 20),
    
    (bannas_chowki_cafe_id, 'Murg gul-marg (Half)', 'Chicken in special gravy - Half portion', 349, 'Murg Mehak e Zaika', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Murg gul-marg (Full)', 'Chicken in special gravy - Full portion', 499, 'Murg Mehak e Zaika', true, false, false, 20),
    
    (bannas_chowki_cafe_id, 'Afgani Chicken (Half)', 'Afghani style chicken - Half portion', 349, 'Murg Mehak e Zaika', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Afgani Chicken (Full)', 'Afghani style chicken - Full portion', 499, 'Murg Mehak e Zaika', true, false, false, 20),
    
    (bannas_chowki_cafe_id, 'Chicken Changezi (Half)', 'Changezi style chicken - Half portion', 349, 'Murg Mehak e Zaika', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Chicken Changezi (Full)', 'Changezi style chicken - Full portion', 499, 'Murg Mehak e Zaika', true, false, false, 20),
    
    (bannas_chowki_cafe_id, 'Chowki Special (Half)', 'House special chicken curry - Half portion', 449, 'Murg Mehak e Zaika', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Chowki Special (Full)', 'House special chicken curry - Full portion', 799, 'Murg Mehak e Zaika', true, false, false, 20);
    
    GET DIAGNOSTICS items_added = ROW_COUNT;
    RAISE NOTICE 'Added % Murg Mehak e Zaika items', items_added;
    
    -- ========================================
    -- MURG E MASTANI (CHICKEN STARTERS)
    -- ========================================
    
    INSERT INTO menu_items (cafe_id, name, description, price, category, is_available, out_of_stock, is_vegetarian, preparation_time)
    VALUES
    (bannas_chowki_cafe_id, 'Chilli Chicken', 'Spicy chilli chicken', 239, 'Murg e Mastani', true, false, false, 15),
    (bannas_chowki_cafe_id, 'Fried Chicken', 'Crispy fried chicken', 199, 'Murg e Mastani', true, false, false, 15),
    (bannas_chowki_cafe_id, 'Roasted Chicken', 'Tender roasted chicken', 199, 'Murg e Mastani', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Chicken lollipop', 'Chicken lollipop', 299, 'Murg e Mastani', true, false, false, 15),
    (bannas_chowki_cafe_id, 'Chicken Tikka', 'Tandoori chicken tikka', 239, 'Murg e Mastani', true, false, false, 15);
    
    GET DIAGNOSTICS items_added = ROW_COUNT;
    RAISE NOTICE 'Added % Murg e Mastani items', items_added;
    
    -- ========================================
    -- RAJASTHAN RE SHAAN (MUTTON) - Half and Full portions
    -- ========================================
    
    INSERT INTO menu_items (cafe_id, name, description, price, category, is_available, out_of_stock, is_vegetarian, preparation_time)
    VALUES
    (bannas_chowki_cafe_id, 'Lal Maas (Half)', 'Spicy red mutton curry - Half portion', 549, 'Rajasthan re Shaan', true, false, false, 25),
    (bannas_chowki_cafe_id, 'Lal Maas (Full)', 'Spicy red mutton curry - Full portion', 999, 'Rajasthan re Shaan', true, false, false, 25),
    
    (bannas_chowki_cafe_id, 'Handi Mutton (Half)', 'Mutton cooked in handi - Half portion', 549, 'Rajasthan re Shaan', true, false, false, 25),
    (bannas_chowki_cafe_id, 'Handi Mutton (Full)', 'Mutton cooked in handi - Full portion', 999, 'Rajasthan re Shaan', true, false, false, 25),
    
    (bannas_chowki_cafe_id, 'Mutton Curry (Half)', 'Traditional mutton curry - Half portion', 549, 'Rajasthan re Shaan', true, false, false, 25),
    (bannas_chowki_cafe_id, 'Mutton Curry (Full)', 'Traditional mutton curry - Full portion', 999, 'Rajasthan re Shaan', true, false, false, 25),
    
    (bannas_chowki_cafe_id, 'Keema Kaleji (Half)', 'Mutton mince and liver curry - Half portion', 449, 'Rajasthan re Shaan', true, false, false, 25),
    (bannas_chowki_cafe_id, 'Keema Kaleji (Full)', 'Mutton mince and liver curry - Full portion', 889, 'Rajasthan re Shaan', true, false, false, 25),
    
    (bannas_chowki_cafe_id, 'Kashmiri Mutton (Half)', 'Kashmiri style mutton curry - Half portion', 649, 'Rajasthan re Shaan', true, false, false, 25),
    (bannas_chowki_cafe_id, 'Kashmiri Mutton (Full)', 'Kashmiri style mutton curry - Full portion', 999, 'Rajasthan re Shaan', true, false, false, 25),
    
    (bannas_chowki_cafe_id, 'Mutton Rogan-Josh (Half)', 'Classic mutton rogan josh - Half portion', 550, 'Rajasthan re Shaan', true, false, false, 25),
    (bannas_chowki_cafe_id, 'Mutton Rogan-Josh (Full)', 'Classic mutton rogan josh - Full portion', 999, 'Rajasthan re Shaan', true, false, false, 25);
    
    GET DIAGNOSTICS items_added = ROW_COUNT;
    RAISE NOTICE 'Added % Rajasthan re Shaan items', items_added;
    
    -- ========================================
    -- MEAL FOR 1 (CHICKEN) - with Tandoori Roti (2) and with Naan (2)
    -- ========================================
    
    INSERT INTO menu_items (cafe_id, name, description, price, category, is_available, out_of_stock, is_vegetarian, preparation_time)
    VALUES
    (bannas_chowki_cafe_id, 'Butter Chicken with Tandoori Roti (2)', 'Creamy butter chicken with 2 Tandoori Roti', 159, 'Meal for 1 (Chicken)', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Butter Chicken with Naan (2)', 'Creamy butter chicken with 2 Naan', 189, 'Meal for 1 (Chicken)', true, false, false, 20),
    
    (bannas_chowki_cafe_id, 'Tawa Chicken with Tandoori Roti (2)', 'Tawa cooked chicken with 2 Tandoori Roti', 159, 'Meal for 1 (Chicken)', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Tawa Chicken with Naan (2)', 'Tawa cooked chicken with 2 Naan', 189, 'Meal for 1 (Chicken)', true, false, false, 20),
    
    (bannas_chowki_cafe_id, 'Chicken Curry with Tandoori Roti (2)', 'Traditional chicken curry with 2 Tandoori Roti', 159, 'Meal for 1 (Chicken)', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Chicken Curry with Naan (2)', 'Traditional chicken curry with 2 Naan', 189, 'Meal for 1 (Chicken)', true, false, false, 20),
    
    (bannas_chowki_cafe_id, 'Chicken Tikka Masala with Tandoori Roti (2)', 'Tandoori chicken in creamy masala with 2 Tandoori Roti', 159, 'Meal for 1 (Chicken)', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Chicken Tikka Masala with Naan (2)', 'Tandoori chicken in creamy masala with 2 Naan', 189, 'Meal for 1 (Chicken)', true, false, false, 20),
    
    (bannas_chowki_cafe_id, 'Handi Chicken with Tandoori Roti (2)', 'Chicken cooked in handi with 2 Tandoori Roti', 159, 'Meal for 1 (Chicken)', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Handi Chicken with Naan (2)', 'Chicken cooked in handi with 2 Naan', 189, 'Meal for 1 (Chicken)', true, false, false, 20),
    
    (bannas_chowki_cafe_id, 'Noor-e-Kali Mirch with Tandoori Roti (2)', 'Chicken in black pepper sauce with 2 Tandoori Roti', 159, 'Meal for 1 (Chicken)', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Noor-e-Kali Mirch with Naan (2)', 'Chicken in black pepper sauce with 2 Naan', 189, 'Meal for 1 (Chicken)', true, false, false, 20),
    
    (bannas_chowki_cafe_id, 'Murg gul-marg with Tandoori Roti (2)', 'Chicken in special gravy with 2 Tandoori Roti', 159, 'Meal for 1 (Chicken)', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Murg gul-marg with Naan (2)', 'Chicken in special gravy with 2 Naan', 189, 'Meal for 1 (Chicken)', true, false, false, 20),
    
    (bannas_chowki_cafe_id, 'Afgani Chicken with Tandoori Roti (2)', 'Afghani style chicken with 2 Tandoori Roti', 159, 'Meal for 1 (Chicken)', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Afgani Chicken with Naan (2)', 'Afghani style chicken with 2 Naan', 189, 'Meal for 1 (Chicken)', true, false, false, 20),
    
    (bannas_chowki_cafe_id, 'Chicken Keema with Tandoori Roti (2)', 'Chicken mince curry with 2 Tandoori Roti', 159, 'Meal for 1 (Chicken)', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Chicken Keema with Naan (2)', 'Chicken mince curry with 2 Naan', 189, 'Meal for 1 (Chicken)', true, false, false, 20),
    
    (bannas_chowki_cafe_id, 'Chicken Changezi with Tandoori Roti (2)', 'Changezi style chicken with 2 Tandoori Roti', 159, 'Meal for 1 (Chicken)', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Chicken Changezi with Naan (2)', 'Changezi style chicken with 2 Naan', 189, 'Meal for 1 (Chicken)', true, false, false, 20),
    
    (bannas_chowki_cafe_id, 'Chowki Special with Tandoori Roti (2)', 'House special chicken curry with 2 Tandoori Roti', 159, 'Meal for 1 (Chicken)', true, false, false, 20),
    (bannas_chowki_cafe_id, 'Chowki Special with Naan (2)', 'House special chicken curry with 2 Naan', 189, 'Meal for 1 (Chicken)', true, false, false, 20);
    
    GET DIAGNOSTICS items_added = ROW_COUNT;
    RAISE NOTICE 'Added % Meal for 1 (Chicken) items', items_added;
    
    -- ========================================
    -- CHAAP - Half and Full portions
    -- ========================================
    
    INSERT INTO menu_items (cafe_id, name, description, price, category, is_available, out_of_stock, is_vegetarian, preparation_time)
    VALUES
    (bannas_chowki_cafe_id, 'Afgani Chaap (Half)', 'Afghani style chaap - Half portion', 129, 'Chaap', true, false, true, 15),
    (bannas_chowki_cafe_id, 'Afgani Chaap (Full)', 'Afghani style chaap - Full portion', 229, 'Chaap', true, false, true, 15),
    
    (bannas_chowki_cafe_id, 'Malai Chaap (Half)', 'Creamy malai chaap - Half portion', 129, 'Chaap', true, false, true, 15),
    (bannas_chowki_cafe_id, 'Malai Chaap (Full)', 'Creamy malai chaap - Full portion', 229, 'Chaap', true, false, true, 15),
    
    (bannas_chowki_cafe_id, 'Masala Chaap (Half)', 'Spicy masala chaap - Half portion', 129, 'Chaap', true, false, true, 15),
    (bannas_chowki_cafe_id, 'Masala Chaap (Full)', 'Spicy masala chaap - Full portion', 229, 'Chaap', true, false, true, 15),
    
    (bannas_chowki_cafe_id, 'Hariyali Chaap (Half)', 'Green herb chaap - Half portion', 129, 'Chaap', true, false, true, 15),
    (bannas_chowki_cafe_id, 'Hariyali Chaap (Full)', 'Green herb chaap - Full portion', 229, 'Chaap', true, false, true, 15),
    
    (bannas_chowki_cafe_id, 'KFC Chaap (Half)', 'KFC style chaap - Half portion', 129, 'Chaap', true, false, true, 15),
    (bannas_chowki_cafe_id, 'KFC Chaap (Full)', 'KFC style chaap - Full portion', 229, 'Chaap', true, false, true, 15),
    
    (bannas_chowki_cafe_id, 'Mix Chaap (Half)', 'Mixed chaap - Half portion', 129, 'Chaap', true, false, true, 15),
    (bannas_chowki_cafe_id, 'Mix Chaap (Full)', 'Mixed chaap - Full portion', 229, 'Chaap', true, false, true, 15),
    
    (bannas_chowki_cafe_id, 'Tawa Chaap (Half)', 'Tawa cooked chaap - Half portion', 129, 'Chaap', true, false, true, 15),
    (bannas_chowki_cafe_id, 'Tawa Chaap (Full)', 'Tawa cooked chaap - Full portion', 229, 'Chaap', true, false, true, 15),
    
    (bannas_chowki_cafe_id, 'Achari Chaap (Half)', 'Pickle flavored chaap - Half portion', 129, 'Chaap', true, false, true, 15),
    (bannas_chowki_cafe_id, 'Achari Chaap (Full)', 'Pickle flavored chaap - Full portion', 229, 'Chaap', true, false, true, 15),
    
    (bannas_chowki_cafe_id, 'Cheese & Garlic Chaap (Half)', 'Cheese and garlic chaap - Half portion', 129, 'Chaap', true, false, true, 15),
    (bannas_chowki_cafe_id, 'Cheese & Garlic Chaap (Full)', 'Cheese and garlic chaap - Full portion', 229, 'Chaap', true, false, true, 15);
    
    GET DIAGNOSTICS items_added = ROW_COUNT;
    RAISE NOTICE 'Added % Chaap items', items_added;
    
    -- ========================================
    -- MOMO - Steam, Fried, Kurkure, Tandoori
    -- ========================================
    
    INSERT INTO menu_items (cafe_id, name, description, price, category, is_available, out_of_stock, is_vegetarian, preparation_time)
    VALUES
    -- Veg Momo
    (bannas_chowki_cafe_id, 'Veg Momo (Steam)', 'Steamed vegetable momos', 79, 'Momo', true, false, true, 10),
    (bannas_chowki_cafe_id, 'Veg Momo (Fried)', 'Fried vegetable momos', 79, 'Momo', true, false, true, 10),
    (bannas_chowki_cafe_id, 'Veg Momo (Kurkure)', 'Crispy kurkure vegetable momos', 119, 'Momo', true, false, true, 12),
    (bannas_chowki_cafe_id, 'Veg Momo (Tandoori)', 'Tandoori style vegetable momos', 119, 'Momo', true, false, true, 12),
    
    -- Paneer Momo
    (bannas_chowki_cafe_id, 'Paneer Momo (Steam)', 'Steamed paneer momos', 99, 'Momo', true, false, true, 10),
    (bannas_chowki_cafe_id, 'Paneer Momo (Fried)', 'Fried paneer momos', 99, 'Momo', true, false, true, 10),
    (bannas_chowki_cafe_id, 'Paneer Momo (Kurkure)', 'Crispy kurkure paneer momos', 139, 'Momo', true, false, true, 12),
    (bannas_chowki_cafe_id, 'Paneer Momo (Tandoori)', 'Tandoori style paneer momos', 139, 'Momo', true, false, true, 12),
    
    -- Chicken Momo
    (bannas_chowki_cafe_id, 'Chicken Momo (Steam)', 'Steamed chicken momos', 129, 'Momo', true, false, false, 10),
    (bannas_chowki_cafe_id, 'Chicken Momo (Fried)', 'Fried chicken momos', 129, 'Momo', true, false, false, 10),
    (bannas_chowki_cafe_id, 'Chicken Momo (Kurkure)', 'Crispy kurkure chicken momos', 169, 'Momo', true, false, false, 12),
    (bannas_chowki_cafe_id, 'Chicken Momo (Tandoori)', 'Tandoori style chicken momos', 169, 'Momo', true, false, false, 12),
    
    -- Mutton Momo
    (bannas_chowki_cafe_id, 'Mutton Momo (Steam)', 'Steamed mutton momos', 179, 'Momo', true, false, false, 10),
    (bannas_chowki_cafe_id, 'Mutton Momo (Fried)', 'Fried mutton momos', 179, 'Momo', true, false, false, 10),
    (bannas_chowki_cafe_id, 'Mutton Momo (Kurkure)', 'Crispy kurkure mutton momos', 209, 'Momo', true, false, false, 12),
    (bannas_chowki_cafe_id, 'Mutton Momo (Tandoori)', 'Tandoori style mutton momos', 209, 'Momo', true, false, false, 12);
    
    GET DIAGNOSTICS items_added = ROW_COUNT;
    RAISE NOTICE 'Added % Momo items', items_added;
    
    -- ========================================
    -- PASTA
    -- ========================================
    
    INSERT INTO menu_items (cafe_id, name, description, price, category, is_available, out_of_stock, is_vegetarian, preparation_time)
    VALUES
    (bannas_chowki_cafe_id, 'Arrabiata', 'Spicy arrabiata pasta', 149, 'Pasta', true, false, true, 12),
    (bannas_chowki_cafe_id, 'Alferado', 'Creamy alfredo pasta', 179, 'Pasta', true, false, true, 12),
    (bannas_chowki_cafe_id, 'Salsa Rosa', 'Pink sauce pasta', 119, 'Pasta', true, false, true, 12),
    (bannas_chowki_cafe_id, 'Cheese Baked Pasta', 'Baked pasta with cheese', 119, 'Pasta', true, false, true, 15);
    
    GET DIAGNOSTICS items_added = ROW_COUNT;
    RAISE NOTICE 'Added % Pasta items', items_added;
    
    -- ========================================
    -- GRAVY CHAAP - Half and Full portions
    -- ========================================
    
    INSERT INTO menu_items (cafe_id, name, description, price, category, is_available, out_of_stock, is_vegetarian, preparation_time)
    VALUES
    (bannas_chowki_cafe_id, 'Veg Kadhai Chaap (Half)', 'Vegetarian kadhai chaap - Half portion', 169, 'Gravy Chaap', true, false, true, 15),
    (bannas_chowki_cafe_id, 'Veg Kadhai Chaap (Full)', 'Vegetarian kadhai chaap - Full portion', 319, 'Gravy Chaap', true, false, true, 15),
    
    (bannas_chowki_cafe_id, 'Veg Lal Maas (Half)', 'Vegetarian red curry - Half portion', 169, 'Gravy Chaap', true, false, true, 15),
    (bannas_chowki_cafe_id, 'Veg Lal Maas (Full)', 'Vegetarian red curry - Full portion', 319, 'Gravy Chaap', true, false, true, 15),
    
    (bannas_chowki_cafe_id, 'Veg Handi Chicken (Half)', 'Vegetarian handi style - Half portion', 169, 'Gravy Chaap', true, false, true, 15),
    (bannas_chowki_cafe_id, 'Veg Handi Chicken (Full)', 'Vegetarian handi style - Full portion', 319, 'Gravy Chaap', true, false, true, 15),
    
    (bannas_chowki_cafe_id, 'Veg Butter Chicken (Half)', 'Vegetarian butter chicken style - Half portion', 169, 'Gravy Chaap', true, false, true, 15),
    (bannas_chowki_cafe_id, 'Veg Butter Chicken (Full)', 'Vegetarian butter chicken style - Full portion', 319, 'Gravy Chaap', true, false, true, 15),
    
    (bannas_chowki_cafe_id, 'Veg Handi Mutton (Half)', 'Vegetarian handi mutton style - Half portion', 169, 'Gravy Chaap', true, false, true, 15),
    (bannas_chowki_cafe_id, 'Veg Handi Mutton (Full)', 'Vegetarian handi mutton style - Full portion', 319, 'Gravy Chaap', true, false, true, 15),
    
    (bannas_chowki_cafe_id, 'Veg Mutton Curry (Half)', 'Vegetarian mutton curry style - Half portion', 169, 'Gravy Chaap', true, false, true, 15),
    (bannas_chowki_cafe_id, 'Veg Mutton Curry (Full)', 'Vegetarian mutton curry style - Full portion', 319, 'Gravy Chaap', true, false, true, 15),
    
    (bannas_chowki_cafe_id, 'Veg Keema Kaleji (Half)', 'Vegetarian keema kaleji style - Half portion', 169, 'Gravy Chaap', true, false, true, 15),
    (bannas_chowki_cafe_id, 'Veg Keema Kaleji (Full)', 'Vegetarian keema kaleji style - Full portion', 319, 'Gravy Chaap', true, false, true, 15);
    
    GET DIAGNOSTICS items_added = ROW_COUNT;
    RAISE NOTICE 'Added % Gravy Chaap items', items_added;
    
    -- ========================================
    -- BURGER
    -- ========================================
    
    INSERT INTO menu_items (cafe_id, name, description, price, category, is_available, out_of_stock, is_vegetarian, preparation_time)
    VALUES
    (bannas_chowki_cafe_id, 'Crispy veg', 'Crispy vegetable burger', 59, 'Burger', true, false, true, 10),
    (bannas_chowki_cafe_id, 'Crispy Paneer', 'Crispy paneer burger', 89, 'Burger', true, false, true, 10),
    (bannas_chowki_cafe_id, 'Cheese Burger', 'Cheese burger', 89, 'Burger', true, false, true, 10),
    (bannas_chowki_cafe_id, 'Chicken Burger', 'Chicken burger', 99, 'Burger', true, false, false, 10),
    (bannas_chowki_cafe_id, 'Mutton Burger', 'Mutton burger', 119, 'Burger', true, false, false, 10);
    
    GET DIAGNOSTICS items_added = ROW_COUNT;
    RAISE NOTICE 'Added % Burger items', items_added;
    
    -- ========================================
    -- PANEER STARTERS & MUSHROOM
    -- ========================================
    
    INSERT INTO menu_items (cafe_id, name, description, price, category, is_available, out_of_stock, is_vegetarian, preparation_time)
    VALUES
    (bannas_chowki_cafe_id, 'Paneer Tikka', 'Tandoori paneer tikka', 179, 'Paneer Starters & Mushroom', true, false, true, 15),
    (bannas_chowki_cafe_id, 'Paneer Malai Tikka', 'Creamy malai paneer tikka', 219, 'Paneer Starters & Mushroom', true, false, true, 15),
    (bannas_chowki_cafe_id, 'Paneer Achari Tikka', 'Pickle flavored paneer tikka', 199, 'Paneer Starters & Mushroom', true, false, true, 15),
    (bannas_chowki_cafe_id, 'Paneer Hariyali Tikka', 'Green herb paneer tikka', 199, 'Paneer Starters & Mushroom', true, false, true, 15),
    (bannas_chowki_cafe_id, 'Paneer Lehsuni', 'Garlic flavored paneer', 179, 'Paneer Starters & Mushroom', true, false, true, 15),
    (bannas_chowki_cafe_id, 'Peshwari Paneer Tikka', 'Peshwari style paneer tikka', 179, 'Paneer Starters & Mushroom', true, false, true, 15);
    
    GET DIAGNOSTICS items_added = ROW_COUNT;
    RAISE NOTICE 'Added % Paneer Starters & Mushroom items', items_added;
    
    -- ========================================
    -- BREADS
    -- ========================================
    
    INSERT INTO menu_items (cafe_id, name, description, price, category, is_available, out_of_stock, is_vegetarian, preparation_time)
    VALUES
    (bannas_chowki_cafe_id, 'Tandoori Roti', 'Fresh tandoori roti', 10, 'Breads', true, false, true, 5),
    (bannas_chowki_cafe_id, 'Missi Roti', 'Spiced missi roti', 22, 'Breads', true, false, true, 5),
    (bannas_chowki_cafe_id, 'Stuff Naan', 'Stuffed naan', 70, 'Breads', true, false, true, 5),
    (bannas_chowki_cafe_id, 'Garlic Naan', 'Garlic flavored naan', 70, 'Breads', true, false, true, 5),
    (bannas_chowki_cafe_id, 'Rumali Roti', 'Thin rumali roti', 20, 'Breads', true, false, true, 5),
    (bannas_chowki_cafe_id, 'Laccha Paratha', 'Layered laccha paratha', 22, 'Breads', true, false, true, 5),
    (bannas_chowki_cafe_id, 'Naan', 'Plain naan', 60, 'Breads', true, false, true, 5);
    
    GET DIAGNOSTICS items_added = ROW_COUNT;
    RAISE NOTICE 'Added % Breads items', items_added;
    
    -- ========================================
    -- RICE
    -- ========================================
    
    INSERT INTO menu_items (cafe_id, name, description, price, category, is_available, out_of_stock, is_vegetarian, preparation_time)
    VALUES
    (bannas_chowki_cafe_id, 'Veg Fried Rice', 'Vegetable fried rice', 120, 'Rice', true, false, true, 12),
    (bannas_chowki_cafe_id, 'Paneer Fried Rice', 'Paneer fried rice', 129, 'Rice', true, false, true, 12),
    (bannas_chowki_cafe_id, 'Chicken Fried Rice', 'Chicken fried rice', 179, 'Rice', true, false, false, 12),
    (bannas_chowki_cafe_id, 'Mutton Fried Rice', 'Mutton fried rice', 249, 'Rice', true, false, false, 12);
    
    GET DIAGNOSTICS items_added = ROW_COUNT;
    RAISE NOTICE 'Added % Rice items', items_added;
    
    -- ========================================
    -- DAHI (RAITA)
    -- ========================================
    
    INSERT INTO menu_items (cafe_id, name, description, price, category, is_available, out_of_stock, is_vegetarian, preparation_time)
    VALUES
    (bannas_chowki_cafe_id, 'Plai Dahi', 'Plain curd', 40, 'Dahi', true, false, true, 2),
    (bannas_chowki_cafe_id, 'Veg Raita', 'Mixed vegetable raita', 50, 'Dahi', true, false, true, 2),
    (bannas_chowki_cafe_id, 'Boondi Raita', 'Boondi raita', 50, 'Dahi', true, false, true, 2),
    (bannas_chowki_cafe_id, 'Pineapple Raita', 'Pineapple raita', 80, 'Dahi', true, false, true, 2),
    (bannas_chowki_cafe_id, 'Chowki Special Raita', 'House special raita', 119, 'Dahi', true, false, true, 2);
    
    GET DIAGNOSTICS items_added = ROW_COUNT;
    RAISE NOTICE 'Added % Dahi items', items_added;
    
    -- ========================================
    -- SALADS
    -- ========================================
    
    INSERT INTO menu_items (cafe_id, name, description, price, category, is_available, out_of_stock, is_vegetarian, preparation_time)
    VALUES
    (bannas_chowki_cafe_id, 'Green Salad', 'Fresh green salad', 79, 'Salads', true, false, true, 5),
    (bannas_chowki_cafe_id, 'Onion Salad', 'Onion salad', 49, 'Salads', true, false, true, 5),
    (bannas_chowki_cafe_id, 'Kachumbar Salad', 'Mixed kachumbar salad', 99, 'Salads', true, false, true, 5);
    
    GET DIAGNOSTICS items_added = ROW_COUNT;
    RAISE NOTICE 'Added % Salads items', items_added;
    
    -- ========================================
    -- NOODLES
    -- ========================================
    
    INSERT INTO menu_items (cafe_id, name, description, price, category, is_available, out_of_stock, is_vegetarian, preparation_time)
    VALUES
    (bannas_chowki_cafe_id, 'Veg Noodles', 'Vegetable noodles', 119, 'Noodles', true, false, true, 12),
    (bannas_chowki_cafe_id, 'Hakka Noodles', 'Hakka style noodles', 119, 'Noodles', true, false, true, 12),
    (bannas_chowki_cafe_id, 'Chilli Garlic Noodles', 'Spicy chilli garlic noodles', 129, 'Noodles', true, false, true, 12),
    (bannas_chowki_cafe_id, 'Paneer Noodles', 'Paneer noodles', 139, 'Noodles', true, false, true, 12),
    (bannas_chowki_cafe_id, 'Chicken Noodles', 'Chicken noodles', 179, 'Noodles', true, false, false, 12),
    (bannas_chowki_cafe_id, 'Mutton Noodles', 'Mutton noodles', 149, 'Noodles', true, false, false, 12),
    (bannas_chowki_cafe_id, 'Singapore Noodles', 'Singapore style noodles', 159, 'Noodles', true, false, true, 12);
    
    GET DIAGNOSTICS items_added = ROW_COUNT;
    RAISE NOTICE 'Added % Noodles items', items_added;
    
    -- ========================================
    -- BEVERAGES
    -- ========================================
    
    INSERT INTO menu_items (cafe_id, name, description, price, category, is_available, out_of_stock, is_vegetarian, preparation_time)
    VALUES
    (bannas_chowki_cafe_id, 'Chai', 'Hot tea', 20, 'Beverages', true, false, true, 3),
    (bannas_chowki_cafe_id, 'Hot Coffee', 'Hot coffee', 40, 'Beverages', true, false, true, 3),
    (bannas_chowki_cafe_id, 'Oreo Shake', 'Oreo milkshake', 120, 'Beverages', true, false, true, 5),
    (bannas_chowki_cafe_id, 'Kiki Shake', 'Kiki milkshake', 120, 'Beverages', true, false, true, 5),
    (bannas_chowki_cafe_id, 'Cold Coffee', 'Cold coffee', 50, 'Beverages', true, false, true, 5),
    (bannas_chowki_cafe_id, 'Virgin Mojito', 'Virgin mojito', 80, 'Beverages', true, false, true, 5),
    (bannas_chowki_cafe_id, 'Blue Lagoon', 'Blue lagoon mocktail', 80, 'Beverages', true, false, true, 5),
    (bannas_chowki_cafe_id, 'Masala Soda', 'Spiced soda', 50, 'Beverages', true, false, true, 3),
    (bannas_chowki_cafe_id, 'Plain Buttermilk', 'Plain buttermilk', 30, 'Beverages', true, false, true, 2),
    (bannas_chowki_cafe_id, 'Masala Buttermilk', 'Spiced buttermilk', 35, 'Beverages', true, false, true, 2),
    (bannas_chowki_cafe_id, 'Banna''s Special Buttermilk', 'House special buttermilk', 35, 'Beverages', true, false, true, 2);
    
    GET DIAGNOSTICS items_added = ROW_COUNT;
    RAISE NOTICE 'Added % Beverages items', items_added;
    
    RAISE NOTICE 'All menu items added successfully to Banna''s Chowki!';
    
END $$;

-- Verification query to show all added items by category
SELECT 
    category,
    COUNT(*) as item_count,
    MIN(price) as min_price,
    MAX(price) as max_price
FROM menu_items mi
JOIN cafes c ON mi.cafe_id = c.id
WHERE c.slug = 'bannas-chowki' OR c.name ILIKE '%banna%chowki%'
GROUP BY category
ORDER BY category;

-- Show total count
SELECT 
    COUNT(*) as total_items_added,
    COUNT(DISTINCT category) as total_categories
FROM menu_items mi
JOIN cafes c ON mi.cafe_id = c.id
WHERE c.slug = 'bannas-chowki' OR c.name ILIKE '%banna%chowki%';

