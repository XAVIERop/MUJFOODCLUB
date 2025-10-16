-- Add Balaji items to 24 Seven Mart
DO $$
DECLARE
    cafe_id_var UUID;
BEGIN
    -- Get 24 Seven Mart cafe ID
    SELECT id INTO cafe_id_var 
    FROM public.cafes 
    WHERE name = '24 Seven Mart'
    LIMIT 1;
    
    IF cafe_id_var IS NULL THEN
        RAISE NOTICE '24 Seven Mart cafe not found. Please create it first.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found 24 Seven Mart cafe with ID: %', cafe_id_var;
    
    -- Insert Balaji items
    INSERT INTO public.menu_items (id, name, description, price, category, is_available, out_of_stock, preparation_time, cafe_id, image_url) VALUES
    (gen_random_uuid(), 'BALAJI WAFERS RUMBLES', 'Crispy and crunchy wafers', 40.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CRUNCHEX SIMPLY SALTED', 'Simply salted crunchy chips', 40.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CRUNCHEX CHILLI TADKA', 'Spicy chilli tadka chips', 40.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CRUNCHEX TOMATO TWIST', 'Tangy tomato twist chips', 40.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CRUNCHEX MASALA MASTI', 'Masala masti chips', 40.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CRUNCHEX CREAM ONION', 'Cream and onion chips', 40.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CRUNCHEX CHAAT CHASKA', 'Chaat chaska chips', 40.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CRUNCHEX SIMPLY SALTED', 'Simply salted crunchy chips', 40.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png')
    
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Balaji items inserted successfully';
    
END $$;

-- Verify Balaji items were added
SELECT 
    name,
    price,
    category,
    is_available
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND (name ILIKE '%balaji%' OR name ILIKE '%crunchx%')
ORDER BY name;
