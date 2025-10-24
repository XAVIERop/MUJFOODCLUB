-- Fix duplicate brand prefixes in item names
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
        RAISE NOTICE '24 Seven Mart cafe not found.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found 24 Seven Mart cafe with ID: %', cafe_id_var;
    
    -- Fix items with multiple brand prefixes
    -- Remove duplicate prefixes and keep only the first one
    
    -- Fix ACT2 + BALAJI items (keep ACT2)
    UPDATE public.menu_items 
    SET name = REPLACE(name, 'ACT2 BALAJI ', 'ACT2 ')
    WHERE cafe_id = cafe_id_var 
      AND name ILIKE 'ACT2 BALAJI %';
    
    -- Fix ACT2 + CORNITOS items (keep ACT2)
    UPDATE public.menu_items 
    SET name = REPLACE(name, 'ACT2 CORNITOS ', 'ACT2 ')
    WHERE cafe_id = cafe_id_var 
      AND name ILIKE 'ACT2 CORNITOS %';
    
    -- Fix ACT2 + LAYS items (keep ACT2)
    UPDATE public.menu_items 
    SET name = REPLACE(name, 'ACT2 LAYS ', 'ACT2 ')
    WHERE cafe_id = cafe_id_var 
      AND name ILIKE 'ACT2 LAYS %';
    
    -- Fix BALAJI + BALAJI items (keep one BALAJI)
    UPDATE public.menu_items 
    SET name = REPLACE(name, 'BALAJI BALAJI ', 'BALAJI ')
    WHERE cafe_id = cafe_id_var 
      AND name ILIKE 'BALAJI BALAJI %';
    
    -- Fix BINGO + BINGO items (keep one BINGO)
    UPDATE public.menu_items 
    SET name = REPLACE(name, 'BINGO BINGO ', 'BINGO ')
    WHERE cafe_id = cafe_id_var 
      AND name ILIKE 'BINGO BINGO %';
    
    -- Fix LAYS + LAYS items (keep one LAYS)
    UPDATE public.menu_items 
    SET name = REPLACE(name, 'LAYS LAYS ', 'LAYS ')
    WHERE cafe_id = cafe_id_var 
      AND name ILIKE 'LAYS LAYS %';
    
    RAISE NOTICE 'Duplicate brand prefixes fixed successfully';
    
END $$;

-- Verify the fixes
SELECT 
    name,
    price,
    category
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = '24 Seven Mart')
  AND category = 'CHIPS'
ORDER BY name
LIMIT 20;
