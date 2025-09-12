-- Fix ELICIT 2025 image and accepting_orders status
UPDATE cafes 
SET 
    image_url = '/elicit_cafecard.JPG',
    accepting_orders = true,
    name = 'ELICIT 2025',
    description = 'ACM ELICIT 2025 Event - Special Menu with Zero Degree Cafe and Dialog'
WHERE slug = 'elicit-2025';

-- Verify the update
SELECT 
    name, 
    slug, 
    image_url, 
    accepting_orders, 
    description 
FROM cafes 
WHERE slug = 'elicit-2025';
