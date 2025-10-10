-- Add CHIPS items to 24 Seven Mart
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
    
    -- Insert CHIPS items
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
    
END $$;

-- Verify CHIPS items were added
SELECT 
    category,
    COUNT(*) as item_count,
    MIN(price) as min_price,
    MAX(price) as max_price
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category IN ('CHIPS', 'SNACKS')
GROUP BY category
ORDER BY category;
