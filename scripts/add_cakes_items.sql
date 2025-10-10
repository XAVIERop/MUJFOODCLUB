-- Add CAKES items to 24 Seven Mart
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
    
    -- Insert CAKES items
    INSERT INTO public.menu_items (id, name, description, price, category, is_available, out_of_stock, preparation_time, cafe_id, image_url) VALUES
    (gen_random_uuid(), 'WINKIES FRUIT CAKE WITH RAISIN & TUTTI FRUTTI', 'Winkies fruit cake with raisin & tutti frutti', 60.00, 'CAKES', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'WINKIES FRUIT CAKE SLICED 40', 'Winkies fruit cake sliced 40', 40.00, 'CAKES', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'WINKIES PINEAPPLE CAKE SLICED', 'Winkies pineapple cake sliced', 30.00, 'CAKES', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'WINKIES MARBLE CAKE SLICED', 'Winkies marble cake sliced', 30.00, 'CAKES', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'WINKIES FRUIT CAKE SLICED 30', 'Winkies fruit cake sliced 30', 30.00, 'CAKES', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'WINKIES CHOCO CAKE SLICED', 'Winkies choco cake sliced', 30.00, 'CAKES', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'WINKIES CAFE SELECT BANANA HAZELNUT SLICED CAKE', 'Winkies cafe select banana hazelnut sliced cake', 40.00, 'CAKES', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'WINKIES CAFE SELECT DOUBLE CHOCO SLICED CAKE', 'Winkies cafe select double choco sliced cake', 40.00, 'CAKES', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'WINKIES CHOCOLUV SWISS ROLL', 'Winkies chocoluv swiss roll', 20.00, 'CAKES', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'WINKIES FRUIT CAKE SLICED 20', 'Winkies fruit cake sliced 20', 20.00, 'CAKES', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'WINKIES CLASSIC VANILLA SLICE CAKE', 'Winkies classic vanilla slice cake', 20.00, 'CAKES', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'WINKIES SWISS ROLL STRAWBERRY JAM', 'Winkies swiss roll strawberry jam', 100.00, 'CAKES', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'WINKIES SWISS ROLL CHOCOLATE FLAVOUR', 'Winkies swiss roll chocolate flavour', 100.00, 'CAKES', true, false, 0, cafe_id_var, '/menu_hero.png')
    
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'CAKES items inserted successfully';
    
END $$;

-- Verify CAKES items were added
SELECT 
    category,
    COUNT(*) as item_count,
    MIN(price) as min_price,
    MAX(price) as max_price
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'CAKES'
GROUP BY category;
