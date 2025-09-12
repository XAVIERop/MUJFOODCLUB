-- Add ELICIT event special menu items for Zero Degree Cafe and Dialog
-- These items have special pricing for the ELICIT event

-- First, get the cafe IDs
DO $$
DECLARE
    zero_degree_cafe_id UUID;
    dialog_cafe_id UUID;
BEGIN
    -- Get Zero Degree Cafe ID
    SELECT id INTO zero_degree_cafe_id FROM public.cafes WHERE name = 'ZERO DEGREE CAFE' LIMIT 1;
    
    -- Get Dialog cafe ID
    SELECT id INTO dialog_cafe_id FROM public.cafes WHERE name = 'Dialog' LIMIT 1;
    
    -- Add ELICIT special items for Zero Degree Cafe
    IF zero_degree_cafe_id IS NOT NULL THEN
        INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available, preparation_time) VALUES
        (zero_degree_cafe_id, 'ELICIT - Classic margherita', 'ELICIT Event Special - Classic margherita pizza', 255, 'ELICIT Special', true, 15),
        (zero_degree_cafe_id, 'ELICIT - Veggie lover', 'ELICIT Event Special - Veggie lover pizza', 305, 'ELICIT Special', true, 15),
        (zero_degree_cafe_id, 'ELICIT - Paneer makhani', 'ELICIT Event Special - Paneer makhani', 335, 'ELICIT Special', true, 20),
        (zero_degree_cafe_id, 'ELICIT - Peri peri fries', 'ELICIT Event Special - Peri peri fries', 110, 'ELICIT Special', true, 10),
        (zero_degree_cafe_id, 'ELICIT - Salted fries', 'ELICIT Event Special - Salted fries', 100, 'ELICIT Special', true, 10),
        (zero_degree_cafe_id, 'ELICIT - Ice tea', 'ELICIT Event Special - Ice tea', 60, 'ELICIT Special', true, 5),
        (zero_degree_cafe_id, 'ELICIT - Cold coffee', 'ELICIT Event Special - Cold coffee', 80, 'ELICIT Special', true, 5);
        
        RAISE NOTICE 'Added ELICIT menu items for Zero Degree Cafe';
    END IF;
    
    -- Add ELICIT special items for Dialog
    IF dialog_cafe_id IS NOT NULL THEN
        INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available, preparation_time) VALUES
        (dialog_cafe_id, 'ELICIT - C4', 'ELICIT Event Special - C4 pizza', 390, 'ELICIT Special', true, 15),
        (dialog_cafe_id, 'ELICIT - Paneer makhani', 'ELICIT Event Special - Paneer makhani', 455, 'ELICIT Special', true, 20),
        (dialog_cafe_id, 'ELICIT - High five', 'ELICIT Event Special - High five pizza', 400, 'ELICIT Special', true, 15),
        (dialog_cafe_id, 'ELICIT - Cold coffee', 'ELICIT Event Special - Cold coffee', 125, 'ELICIT Special', true, 5),
        (dialog_cafe_id, 'ELICIT - Oreo shake', 'ELICIT Event Special - Oreo shake', 145, 'ELICIT Special', true, 10),
        (dialog_cafe_id, 'ELICIT - Coke', 'ELICIT Event Special - Coke', 40, 'ELICIT Special', true, 2);
        
        RAISE NOTICE 'Added ELICIT menu items for Dialog';
    END IF;
    
    RAISE NOTICE 'ELICIT menu items migration completed successfully';
END $$;
