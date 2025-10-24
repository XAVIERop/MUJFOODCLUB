-- Add COLDDRINK items to 24 Seven Mart
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
    
    -- Insert COLDDRINK items
    INSERT INTO public.menu_items (id, name, description, price, category, is_available, out_of_stock, preparation_time, cafe_id, image_url) VALUES
    -- PEPSI
    (gen_random_uuid(), 'PEPSI', 'Refreshing cola drink', 20.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'BLACK PEPSI', 'Black pepsi cola drink', 20.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'TROPICANA MIXFRUIT GAVAWA', 'Tropicana mixed fruit drink', 30.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'MIRINDA', 'Orange flavored drink', 20.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'MIRINDA 40', 'Orange flavored drink 40ml', 40.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'NUMBOOZ', 'Lemon flavored drink', 20.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'DEW', 'Mountain dew drink', 20.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'DEW 40', 'Mountain dew drink 40ml', 40.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CHOCO CHOCO', 'Chocolate flavored drink', 30.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CREAM BELL KESAR BADAM VANILA', 'Cream bell kesar badam vanilla', 20.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'SLICE', 'Slice fruit drink', 20.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'SLICE 40', 'Slice fruit drink 40ml', 40.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'MAZZA', 'Mazza fruit drink', 20.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'MAZZA 40', 'Mazza fruit drink 40ml', 40.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), '7UP', '7UP lemon lime drink', 20.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'ORANGE PULPY', 'Orange pulpy drink', 20.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    
    -- COKE
    (gen_random_uuid(), 'COKE 250ml', 'Coca cola 250ml', 20.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'COKE 750ml', 'Coca cola 750ml', 40.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'THUMS UP 250ml', 'Thums up 250ml', 20.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'THUMS UP 750ml', 'Thums up 750ml', 40.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'LIMCA 250ml', 'Limca 250ml', 20.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'FANTA 750ml', 'Fanta 750ml', 40.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'SPRITE 250ml', 'Sprite 250ml', 20.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'SPRITE 750ml', 'Sprite 750ml', 40.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'DIET COKE 300ml', 'Diet coke 300ml', 40.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'COKE 300ml', 'Coke 300ml', 40.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'FANTA 300ml', 'Fanta 300ml', 40.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'THUMS UP 300ml', 'Thums up 300ml', 40.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'ZERO COKE 300ml', 'Zero coke 300ml', 40.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'PREDATOR 330ml', 'Predator energy drink 330ml', 60.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'MONSTER WHITE ULTRA', 'Monster white ultra energy drink', 125.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'MONSTER GREEN', 'Monster green energy drink', 125.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png')
    
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'COLDDRINK items inserted successfully';
    
END $$;

-- Verify COLDDRINK items were added
SELECT 
    category,
    COUNT(*) as item_count,
    MIN(price) as min_price,
    MAX(price) as max_price
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'COLDDRINK'
GROUP BY category;
