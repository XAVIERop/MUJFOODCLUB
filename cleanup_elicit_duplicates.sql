-- Clean up ELICIT duplicates and fix the remaining one
DO $$
DECLARE
    elicit_2024_id UUID;
    elicit_2025_id UUID;
BEGIN
    -- Get both ELICIT cafe IDs
    SELECT id INTO elicit_2024_id FROM cafes WHERE slug = 'elicit-2024';
    SELECT id INTO elicit_2025_id FROM cafes WHERE slug = 'elicit-2025';
    
    -- Delete the old ELICIT 2024 and its menu items
    IF elicit_2024_id IS NOT NULL THEN
        -- Delete menu items first
        DELETE FROM menu_items WHERE cafe_id = elicit_2024_id;
        
        -- Delete the cafe
        DELETE FROM cafes WHERE id = elicit_2024_id;
        
        RAISE NOTICE 'Deleted ELICIT 2024 and its menu items';
    END IF;
    
    -- Update ELICIT 2025 to fix image and accepting_orders
    IF elicit_2025_id IS NOT NULL THEN
        UPDATE cafes 
        SET 
            image_url = '/elicit_cafecard.JPG',
            accepting_orders = true,
            name = 'ELICIT 2025',
            description = 'ACM ELICIT 2025 Event - Special Menu with Zero Degree Cafe and Dialog'
        WHERE id = elicit_2025_id;
        
        RAISE NOTICE 'Updated ELICIT 2025 with correct image and settings';
    ELSE
        RAISE NOTICE 'ELICIT 2025 not found, creating it now...';
        
        -- Create ELICIT 2025 if it doesn't exist
        INSERT INTO cafes (
            id,
            name,
            type,
            description,
            location,
            phone,
            hours,
            accepting_orders,
            average_rating,
            total_ratings,
            cuisine_categories,
            priority,
            slug,
            image_url
        ) VALUES (
            gen_random_uuid(),
            'ELICIT 2025',
            'Event Cafe',
            'ACM ELICIT 2025 Event - Special Menu with Zero Degree Cafe and Dialog',
            'MUJ Campus',
            '+91-9876543210',
            '24/7',
            true,
            4.5,
            0,
            ARRAY['Event', 'Special Menu'],
            1,
            'elicit-2025',
            '/elicit_cafecard.JPG'
        );
        
        -- Get the new cafe ID
        SELECT id INTO elicit_2025_id FROM cafes WHERE slug = 'elicit-2025';
        
        -- Add menu items
        INSERT INTO menu_items (
            id,
            cafe_id,
            name,
            description,
            price,
            category,
            preparation_time,
            is_available,
            image_url
        ) VALUES 
        (gen_random_uuid(), elicit_2025_id, 'Classic Margherita', 'Fresh tomato sauce, mozzarella, basil', 255, 'Zero Degree Cafe', 15, true, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400'),
        (gen_random_uuid(), elicit_2025_id, 'Veggie Lover', 'Mixed vegetables, mozzarella, tomato sauce', 305, 'Zero Degree Cafe', 15, true, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'),
        (gen_random_uuid(), elicit_2025_id, 'Paneer Makhani', 'Paneer in creamy tomato sauce', 335, 'Zero Degree Cafe', 15, true, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'),
        (gen_random_uuid(), elicit_2025_id, 'Peri Peri Fries', 'Spicy peri peri seasoned fries', 110, 'Zero Degree Cafe', 10, true, 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400'),
        (gen_random_uuid(), elicit_2025_id, 'Salted Fries', 'Classic salted potato fries', 100, 'Zero Degree Cafe', 10, true, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400'),
        (gen_random_uuid(), elicit_2025_id, 'Ice Tea', 'Refreshing iced tea', 60, 'Zero Degree Cafe', 5, true, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'),
        (gen_random_uuid(), elicit_2025_id, 'Cold Coffee', 'Rich and creamy cold coffee', 80, 'Zero Degree Cafe', 5, true, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400'),
        (gen_random_uuid(), elicit_2025_id, 'C4', 'Special C4 drink', 390, 'Dialog', 10, true, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400'),
        (gen_random_uuid(), elicit_2025_id, 'Paneer Makhani', 'Paneer in creamy tomato sauce', 455, 'Dialog', 15, true, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'),
        (gen_random_uuid(), elicit_2025_id, 'High Five', 'Special High Five drink', 400, 'Dialog', 10, true, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400'),
        (gen_random_uuid(), elicit_2025_id, 'Cold Coffee', 'Rich and creamy cold coffee', 125, 'Dialog', 5, true, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400'),
        (gen_random_uuid(), elicit_2025_id, 'Oreo Shake', 'Creamy Oreo milkshake', 145, 'Dialog', 10, true, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400'),
        (gen_random_uuid(), elicit_2025_id, 'Coke', 'Classic Coca Cola', 40, 'Dialog', 2, true, 'https://images.unsplash.com/photo-1581636625402-29d2a6f2c0a0?w=400');
        
        RAISE NOTICE 'Created ELICIT 2025 with menu items';
    END IF;
    
    RAISE NOTICE 'Cleanup completed successfully!';
END $$;
