-- Update prices for specific items in Grabit
-- This script updates the prices for Bikaji Bikaneri Bhuja 200 and Cadbury Oreo Choco

DO $$
DECLARE
    grabit_cafe_id UUID;
    updated_count INTEGER := 0;
BEGIN
    -- Get Grabit cafe ID
    SELECT id INTO grabit_cafe_id 
    FROM public.cafes 
    WHERE LOWER(name) LIKE '%grabit%' OR LOWER(slug) = 'grabit'
    LIMIT 1;
    
    IF grabit_cafe_id IS NULL THEN
        RAISE EXCEPTION 'Grabit cafe not found. Please verify the cafe exists.';
    END IF;
    
    RAISE NOTICE 'Found Grabit cafe with ID: %', grabit_cafe_id;
    
    -- Update Bikaji Bikaneri Bhuja 200 from 58 to 60
    UPDATE public.menu_items
    SET 
        price = 60.00,
        updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id
      AND (
        name ILIKE '%bikaji%' 
        AND name ILIKE '%bikaneri%' 
        AND name ILIKE '%bhuja%'
        AND (name ILIKE '%200%' OR description ILIKE '%200%')
      )
      AND price = 58.00;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % row(s) for Bikaji Bikaneri Bhuja 200', updated_count;
    
    -- Update Cadbury Oreo Choco from 30 to 10
    UPDATE public.menu_items
    SET 
        price = 10.00,
        updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id
      AND (
        name ILIKE '%cadbury%' 
        AND name ILIKE '%oreo%' 
        AND name ILIKE '%choco%'
      )
      AND price = 30.00;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % row(s) for Cadbury Oreo Choco', updated_count;
    
    RAISE NOTICE 'Price updates completed successfully!';
    
END $$;

-- Verify the price updates
SELECT 
    name,
    description,
    price,
    category,
    updated_at
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE LOWER(name) LIKE '%grabit%' OR LOWER(slug) = 'grabit')
  AND (
    (name ILIKE '%bikaji%' AND name ILIKE '%bikaneri%' AND name ILIKE '%bhuja%' AND (name ILIKE '%200%' OR description ILIKE '%200%'))
    OR
    (name ILIKE '%cadbury%' AND name ILIKE '%oreo%' AND name ILIKE '%choco%')
  )
ORDER BY name;

