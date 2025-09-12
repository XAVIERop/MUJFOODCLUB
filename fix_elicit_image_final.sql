-- Comprehensive fix for ELICIT 2025 image issue
DO $$
DECLARE
    elicit_cafe_id UUID;
BEGIN
    -- Get ELICIT 2025 cafe ID
    SELECT id INTO elicit_cafe_id FROM cafes WHERE slug = 'elicit-2025';
    
    IF elicit_cafe_id IS NOT NULL THEN
        -- Update the cafe with correct image and settings
        UPDATE cafes 
        SET 
            image_url = '/elicit_cafecard.JPG',
            accepting_orders = true,
            name = 'ELICIT 2025',
            description = 'ACM ELICIT 2025 Event - Special Menu with Zero Degree Cafe and Dialog',
            priority = 1
        WHERE id = elicit_cafe_id;
        
        RAISE NOTICE 'Updated ELICIT 2025 with image: /elicit_cafecard.JPG';
        RAISE NOTICE 'Cafe ID: %', elicit_cafe_id;
        
        -- Show current values
        RAISE NOTICE 'Current image_url: %', (SELECT image_url FROM cafes WHERE id = elicit_cafe_id);
        RAISE NOTICE 'Current accepting_orders: %', (SELECT accepting_orders FROM cafes WHERE id = elicit_cafe_id);
    ELSE
        RAISE NOTICE 'ELICIT 2025 cafe not found!';
    END IF;
END $$;

-- Verify the update
SELECT 
    name, 
    slug, 
    image_url, 
    accepting_orders,
    priority
FROM cafes 
WHERE slug = 'elicit-2025';
