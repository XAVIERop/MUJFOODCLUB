-- Add all grocery items to 24 Seven Mart cafe
-- This script adds all the items from your list to the 24 Seven Mart cafe

-- First, let's check if 24 Seven Mart exists
SELECT id, name, accepting_orders, is_active 
FROM public.cafes 
WHERE name ILIKE '%24 seven mart%' OR name ILIKE '%24 seven%';

-- If 24 Seven Mart doesn't exist, we'll need to create it
-- For now, let's assume it exists and get its ID
DO $$
DECLARE
    cafe_id_var UUID;
BEGIN
    -- Get 24 Seven Mart cafe ID
    SELECT id INTO cafe_id_var 
    FROM public.cafes 
    WHERE name ILIKE '%24 seven mart%' OR name ILIKE '%24 seven%'
    LIMIT 1;
    
    IF cafe_id_var IS NULL THEN
        RAISE NOTICE '24 Seven Mart cafe not found. Please create it first.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found 24 Seven Mart cafe with ID: %', cafe_id_var;
    
    -- Insert all grocery items
    -- CHIPS Category
    INSERT INTO public.menu_items (id, name, description, price, category, is_available, out_of_stock, preparation_time, cafe_id, image_url) VALUES
    -- BALAJI WAFERS
    (gen_random_uuid(), 'BALAJI WAFERS RUMBLES', 'Crispy and crunchy wafers', 40.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    
    -- CRUNCHEX
    (gen_random_uuid(), 'CRUNCHEX SIMPLY SALTED', 'Simply salted crunchy chips', 40.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CRUNCHEX CHILLI TADKA', 'Spicy chilli tadka chips', 40.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CRUNCHEX TOMATO TWIST', 'Tangy tomato twist chips', 40.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CRUNCHEX MASALA MASTI', 'Masala masti chips', 40.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CRUNCHEX CREAM ONION', 'Cream and onion chips', 40.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CRUNCHEX CHAAT CHASKA', 'Chaat chaska chips', 40.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    
    -- LAYS
    (gen_random_uuid(), 'LAYS AMERICAN STYLE CREAM AND ONION', 'American style cream and onion chips', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'LAYS CLASSIC SALTED', 'Classic salted chips', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'LAYS TOMATO TANGO', 'Tangy tomato chips', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'LAYS INDIA MAGIC MASALA', 'India magic masala chips', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'LAYS SOUR CREAM AND ONION', 'Sour cream and onion chips', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'LAYS SIZZLING HOT', 'Sizzling hot chips', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'LAYS WEST INDIES HOT AND SWEET CHILLI', 'West Indies hot and sweet chilli chips', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'LAYS CHILLI CHATKA', 'Chilli chatka chips', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'LAYS MASALA MUNCH', 'Masala munch chips', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'LAYS GREEN CHUTNEY STYLYS', 'Green chutney stylys chips', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'LAYS SOLID MASTI', 'Solid masti chips', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'LAYS POPCORN', 'Popcorn chips', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'LAYS SEZWAN CHUTNEY', 'Sezwan chutney chips', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'LAYS UNCAL CHIPS BLUE', 'Uncal chips blue', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'LAYS UNCAL CHIPS GREEN', 'Uncal chips green', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'LAYS CHILLI LIMION', 'Chilli limion chips', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'LAYS CLASSIC SALTED', 'Classic salted chips', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    
    -- CREX
    (gen_random_uuid(), 'CREX RING MASALA MANIA', 'Ring masala mania', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CREX RING TANGY TOMATO', 'Ring tangy tomato', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CREX RING CHATPATA', 'Ring chatpata', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CREX CRAX NATKHAT CLASSIC', 'Crax natkhat classic', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CREX CRAX NATKHAT MASALA', 'Crax natkhat masala', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CREX CRAX CARLS CHATPATA MASALA', 'Crax carls chatpata masala', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CREX CRAX CHEES BALLS', 'Crax chees balls', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    
    -- BINGO MAD ANGLES
    (gen_random_uuid(), 'BINGO MAD ANGLES RED ALERT', 'Mad angles red alert', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'BINGO MAD ANGLES ACHARI MASTI', 'Mad angles achari masti', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'BINGO MAD ANGLES MM MASALA', 'Mad angles mm masala', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'BINGO MAD ANGLES CHAT MASTI', 'Mad angles chat masti', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'BINGO MAD ANGLES TOMATO MADNESS', 'Mad angles tomato madness', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'BINGO MAD ANGLES VERY PERI PERI', 'Mad angles very peri peri', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'BINGO MAD ANGLES PIZZA AAAAH', 'Mad angles pizza aaah', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'BINGO NACHOS CHILLI LEMON', 'Bingo nachos chilli lemon', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'BINGO NACHOS CHEES NACHOS', 'Bingo nachos chees nachos', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'BINGO TADHE MADHE', 'Bingo tadhe madhe', 20.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    
    -- CORNITOS
    (gen_random_uuid(), 'CORNITOS TIKKA MASALA', 'Cornitos tikka masala', 35.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CORNITOS PERI PERI', 'Cornitos peri peri', 35.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CORNITOS THAI', 'Cornitos thai', 35.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CORNITOS SEA SALT', 'Cornitos sea salt', 35.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CORNITOS JALOPENO', 'Cornitos jalopeno', 35.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CORNITOS TOMATO', 'Cornitos tomato', 35.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'CORNITOS SALSA', 'Cornitos salsa', 70.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    
    -- ACT2
    (gen_random_uuid(), 'ACT2 SPICY PUDINA POPCORN', 'Spicy pudina popcorn', 25.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'ACT2 BUTTER POPCORN', 'Butter popcorn', 25.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'ACT2 SALTED POPCORN', 'Salted popcorn', 25.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'ACT2 TOMATO CHILLI POPCORN', 'Tomato chilli popcorn', 25.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'ACT2 CHEESE BURST POPCORN', 'Cheese burst popcorn', 25.00, 'CHIPS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    
    -- POPZ
    (gen_random_uuid(), 'POPZ CHOCOLATY CRUNCH', 'Chocolaty crunch popz', 60.00, 'SNACKS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'POPZ COOKIS & CREME', 'Cookis & creme popz', 60.00, 'SNACKS', true, false, 0, cafe_id_var, '/menu_hero.png'),
    (gen_random_uuid(), 'POPZ HAZELNUT', 'Hazelnut popz', 60.00, 'SNACKS', true, false, 0, cafe_id_var, '/menu_hero.png')
    
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'CHIPS and SNACKS items inserted successfully';
    
    -- COLDDRINK Category
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
    (gen_random_uuid(), 'MONSTER GREEN', 'Monster green energy drink', 125.00, 'COLDDRINK', true, false, 0, cafe_id_var, '/menu_hero.png'),
    
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
    
    RAISE NOTICE 'COLDDRINK and BEVERAGES items inserted successfully';
    
    -- CAKES Category
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
    
    RAISE NOTICE 'All grocery items have been added to 24 Seven Mart cafe successfully!';
    
END $$;

-- Verify the items were added
SELECT 
    category,
    COUNT(*) as item_count,
    MIN(price) as min_price,
    MAX(price) as max_price
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%24 seven mart%' OR name ILIKE '%24 seven%')
GROUP BY category
ORDER BY category;
