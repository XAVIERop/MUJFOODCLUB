-- Update item names to include brand names for better brand filtering
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
    
    -- Update Balaji items
    UPDATE public.menu_items 
    SET name = 'BALAJI ' || name
    WHERE cafe_id = cafe_id_var 
      AND category = 'CHIPS'
      AND (name ILIKE '%RUMBLES%' OR name ILIKE '%CRUNCHEX%');
    
    -- Update Lays items
    UPDATE public.menu_items 
    SET name = 'LAYS ' || name
    WHERE cafe_id = cafe_id_var 
      AND category = 'CHIPS'
      AND (name ILIKE '%AMERICAN STYLE%' OR name ILIKE '%CLASSIC SALTED%' OR name ILIKE '%TOMATO TANGO%' 
           OR name ILIKE '%INDIA MAGIC%' OR name ILIKE '%SOUR CREAM%' OR name ILIKE '%SIZZLING HOT%'
           OR name ILIKE '%WEST INDIES%' OR name ILIKE '%CHILLI CHATKA%' OR name ILIKE '%MASALA MUNCH%'
           OR name ILIKE '%GREEN CHUTNEY%' OR name ILIKE '%SOLID MASTI%' OR name ILIKE '%POPCORN%'
           OR name ILIKE '%SEZWAN%' OR name ILIKE '%UNCAL%' OR name ILIKE '%CHILLI LIMION%');
    
    -- Update Bingo items
    UPDATE public.menu_items 
    SET name = 'BINGO ' || name
    WHERE cafe_id = cafe_id_var 
      AND category = 'CHIPS'
      AND (name ILIKE '%MAD ANGLES%' OR name ILIKE '%NACHOS%' OR name ILIKE '%TADHE MADHE%');
    
    -- Update Cornitos items
    UPDATE public.menu_items 
    SET name = 'CORNITOS ' || name
    WHERE cafe_id = cafe_id_var 
      AND category = 'CHIPS'
      AND (name ILIKE '%TIKKA MASALA%' OR name ILIKE '%PERI PERI%' OR name ILIKE '%THAI%'
           OR name ILIKE '%SEA SALT%' OR name ILIKE '%JALOPENO%' OR name ILIKE '%TOMATO%' OR name ILIKE '%SALSA%');
    
    -- Update Crex items
    UPDATE public.menu_items 
    SET name = 'CREX ' || name
    WHERE cafe_id = cafe_id_var 
      AND category = 'CHIPS'
      AND (name ILIKE '%RING%' OR name ILIKE '%CRAX%');
    
    -- Update Act2 items
    UPDATE public.menu_items 
    SET name = 'ACT2 ' || name
    WHERE cafe_id = cafe_id_var 
      AND category = 'CHIPS'
      AND (name ILIKE '%POPCORN%' OR name ILIKE '%SPICY PUDINA%' OR name ILIKE '%BUTTER%' 
           OR name ILIKE '%SALTED%' OR name ILIKE '%TOMATO CHILLI%' OR name ILIKE '%CHEESE BURST%');
    
    -- Update Popz items
    UPDATE public.menu_items 
    SET name = 'POPZ ' || name
    WHERE cafe_id = cafe_id_var 
      AND category = 'SNACKS'
      AND (name ILIKE '%CHOCOLATY%' OR name ILIKE '%COOKIS%' OR name ILIKE '%HAZELNUT%');
    
    -- Update Pepsi items
    UPDATE public.menu_items 
    SET name = 'PEPSI ' || name
    WHERE cafe_id = cafe_id_var 
      AND category = 'COLDDRINK'
      AND (name ILIKE '%PEPSI%' OR name ILIKE '%BLACK PEPSI%' OR name ILIKE '%TROPICANA%'
           OR name ILIKE '%MIRINDA%' OR name ILIKE '%NUMBOOZ%' OR name ILIKE '%DEW%'
           OR name ILIKE '%CHOCO CHOCO%' OR name ILIKE '%CREAM BELL%' OR name ILIKE '%SLICE%'
           OR name ILIKE '%MAZZA%' OR name ILIKE '%7UP%' OR name ILIKE '%ORANGE PULPY%');
    
    -- Update Coca Cola items
    UPDATE public.menu_items 
    SET name = 'COKE ' || name
    WHERE cafe_id = cafe_id_var 
      AND category = 'COLDDRINK'
      AND (name ILIKE '%COKE%' OR name ILIKE '%THUMS UP%' OR name ILIKE '%LIMCA%'
           OR name ILIKE '%FANTA%' OR name ILIKE '%SPRITE%' OR name ILIKE '%DIET COKE%'
           OR name ILIKE '%ZERO COKE%');
    
    -- Update Paperboat items
    UPDATE public.menu_items 
    SET name = 'PAPERBOAT ' || name
    WHERE cafe_id = cafe_id_var 
      AND category = 'BEVERAGES'
      AND (name ILIKE '%PAPERBOAT%' OR name ILIKE '%ZERO SPARKLING%' OR name ILIKE '%SWING%');
    
    -- Update Winkies items
    UPDATE public.menu_items 
    SET name = 'WINKIES ' || name
    WHERE cafe_id = cafe_id_var 
      AND category = 'CAKES'
      AND (name ILIKE '%WINKIES%' OR name ILIKE '%FRUIT CAKE%' OR name ILIKE '%PINEAPPLE%'
           OR name ILIKE '%MARBLE%' OR name ILIKE '%CHOCO%' OR name ILIKE '%CAFE SELECT%'
           OR name ILIKE '%CHOCOLUV%' OR name ILIKE '%CLASSIC VANILLA%' OR name ILIKE '%SWISS ROLL%');
    
    -- Update Monster items
    UPDATE public.menu_items 
    SET name = 'MONSTER ' || name
    WHERE cafe_id = cafe_id_var 
      AND category = 'COLDDRINK'
      AND (name ILIKE '%MONSTER%');
    
    -- Update Predator items
    UPDATE public.menu_items 
    SET name = 'PREDATOR ' || name
    WHERE cafe_id = cafe_id_var 
      AND category = 'COLDDRINK'
      AND (name ILIKE '%PREDATOR%');
    
    RAISE NOTICE 'Item names updated with brand names successfully';
    
END $$;

-- Verify the updates
SELECT 
    name,
    price,
    category
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'CHIPS'
ORDER BY name
LIMIT 20;
