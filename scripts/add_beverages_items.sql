-- Add BEVERAGES items to 24 Seven Mart
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
    
    -- Insert BEVERAGES items
    INSERT INTO public.menu_items (id, name, description, price, category, is_available, out_of_stock, preparation_time, cafe_id, image_url) VALUES
    -- PAPERBOAT
    (gen_random_uuid(), 'PAPERBOAT ZERO SPARKLING WATER LEMON LIME', 'Zero sparkling water lemon lime', 20.00, 'BEVERAGES', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'PAPERBOAT ZERO SPARKLING WATER GREEN APPLE', 'Zero sparkling water green apple', 20.00, 'BEVERAGES', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'PAPERBOAT SWING COCONUT WATER DRINK', 'Swing coconut water drink', 20.00, 'BEVERAGES', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'PAPERBOAT SWING YUMMY GUAVA JUICIER DRINK', 'Swing yummy guava juicier drink', 20.00, 'BEVERAGES', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'PAPERBOAT SWING MIXED FRUIT MEDLEY', 'Swing mixed fruit medley', 20.00, 'BEVERAGES', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'PAPERBOAT SWING ZESTY POMEGRANATE', 'Swing zesty pomegranate', 20.00, 'BEVERAGES', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'PAPERBOAT SWING LUSH TYCHES', 'Swing lush tyches', 20.00, 'BEVERAGES', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'PAPERBOAT SWING SLEEPY MANGO', 'Swing sleepy mango', 20.00, 'BEVERAGES', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'PAPERBOAT SWING LUSH LYCHES', 'Swing lush lyches', 45.00, 'BEVERAGES', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'PAPERBOAT SWING ZESTY POMEGRANATE 45', 'Swing zesty pomegranate 45ml', 45.00, 'BEVERAGES', true, false, 0, cafe_id_var, '/menu_hero.png')
    
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'BEVERAGES items inserted successfully';
    
END $$;

-- Verify BEVERAGES items were added
SELECT 
    category,
    COUNT(*) as item_count,
    MIN(price) as min_price,
    MAX(price) as max_price
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'BEVERAGES'
GROUP BY category;
