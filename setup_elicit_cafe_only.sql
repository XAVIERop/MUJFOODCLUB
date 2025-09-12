-- Setup ELICIT cafe (without creating auth user)
-- This script prepares the cafe for manual auth user creation

DO $$
DECLARE
    elicit_cafe_id UUID;
BEGIN
    -- Get ELICIT cafe ID
    SELECT id INTO elicit_cafe_id FROM cafes WHERE slug = 'elicit-2025';
    
    IF elicit_cafe_id IS NULL THEN
        RAISE NOTICE 'ELICIT cafe not found. Please create the cafe first.';
        RETURN;
    END IF;
    
    -- Update ELICIT cafe to ensure it's properly configured
    UPDATE cafes 
    SET 
        accepting_orders = true,
        priority = 0,
        image_url = '/elicit_cafecard.JPG',
        updated_at = NOW()
    WHERE id = elicit_cafe_id;
    
    RAISE NOTICE 'ELICIT cafe configured successfully!';
    RAISE NOTICE 'Cafe ID: %', elicit_cafe_id;
    RAISE NOTICE 'Cafe Name: ELICIT 2025';
    RAISE NOTICE 'Accepting Orders: true';
    RAISE NOTICE 'Priority: 0 (highest)';
    RAISE NOTICE 'Image: /elicit_cafecard.JPG';
    
END $$;

-- Show the current cafe status
SELECT 
    c.name,
    c.slug,
    c.accepting_orders,
    c.priority,
    c.image_url,
    c.owner_id,
    c.created_at
FROM cafes c
WHERE c.slug = 'elicit-2025';
