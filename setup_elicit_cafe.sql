-- Create ELICIT as a regular cafe
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
  slug
) VALUES (
  gen_random_uuid(),
  'ELICIT 2024',
  'Event Cafe',
  'ACM ELICIT 2024 Event - Special Menu with Zero Degree Cafe and Dialog',
  'MUJ Campus',
  '+91-9876543210',
  '24/7',
  true,
  4.5,
  0,
  ARRAY['Event', 'Special Menu'],
  1,
  'elicit-2024'
) ON CONFLICT (slug) DO NOTHING;

-- Get the ELICIT cafe ID
DO $$
DECLARE
    elicit_cafe_id UUID;
BEGIN
    -- Get ELICIT cafe ID
    SELECT id INTO elicit_cafe_id FROM cafes WHERE slug = 'elicit-2024';
    
    IF elicit_cafe_id IS NOT NULL THEN
        -- Insert Zero Degree Cafe category items
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
        (gen_random_uuid(), elicit_cafe_id, 'Classic Margherita', 'Fresh tomato sauce, mozzarella, basil', 255, 'Zero Degree Cafe', 15, true, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400'),
        (gen_random_uuid(), elicit_cafe_id, 'Veggie Lover', 'Mixed vegetables, mozzarella, tomato sauce', 305, 'Zero Degree Cafe', 15, true, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'),
        (gen_random_uuid(), elicit_cafe_id, 'Paneer Makhani', 'Paneer in creamy tomato sauce', 335, 'Zero Degree Cafe', 15, true, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'),
        (gen_random_uuid(), elicit_cafe_id, 'Peri Peri Fries', 'Spicy peri peri seasoned fries', 110, 'Zero Degree Cafe', 10, true, 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400'),
        (gen_random_uuid(), elicit_cafe_id, 'Salted Fries', 'Classic salted potato fries', 100, 'Zero Degree Cafe', 10, true, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400'),
        (gen_random_uuid(), elicit_cafe_id, 'Ice Tea', 'Refreshing iced tea', 60, 'Zero Degree Cafe', 5, true, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'),
        (gen_random_uuid(), elicit_cafe_id, 'Cold Coffee', 'Rich and creamy cold coffee', 80, 'Zero Degree Cafe', 5, true, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400'),
        
        -- Insert Dialog category items
        (gen_random_uuid(), elicit_cafe_id, 'C4', 'Special C4 drink', 390, 'Dialog', 10, true, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400'),
        (gen_random_uuid(), elicit_cafe_id, 'Paneer Makhani', 'Paneer in creamy tomato sauce', 455, 'Dialog', 15, true, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'),
        (gen_random_uuid(), elicit_cafe_id, 'High Five', 'Special High Five drink', 400, 'Dialog', 10, true, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400'),
        (gen_random_uuid(), elicit_cafe_id, 'Cold Coffee', 'Rich and creamy cold coffee', 125, 'Dialog', 5, true, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400'),
        (gen_random_uuid(), elicit_cafe_id, 'Oreo Shake', 'Creamy Oreo milkshake', 145, 'Dialog', 10, true, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400'),
        (gen_random_uuid(), elicit_cafe_id, 'Coke', 'Classic Coca Cola', 40, 'Dialog', 2, true, 'https://images.unsplash.com/photo-1581636625402-29d2a6f2c0a0?w=400')
        ON CONFLICT (cafe_id, name) DO NOTHING;
        
        RAISE NOTICE 'ELICIT cafe and menu items created successfully with ID: %', elicit_cafe_id;
    ELSE
        RAISE NOTICE 'ELICIT cafe not found, please check the cafe creation';
    END IF;
END $$;
