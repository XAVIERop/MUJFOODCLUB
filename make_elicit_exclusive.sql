-- Make ELICIT 2025 first priority and ensure it's properly configured
UPDATE cafes 
SET 
    priority = 1,
    accepting_orders = true,
    image_url = '/elicit_cafecard.JPG',
    name = 'ELICIT 2025',
    description = 'ACM ELICIT 2025 Event - Special Menu with Zero Degree Cafe and Dialog'
WHERE slug = 'elicit-2025';

-- Verify the update
SELECT 
    name, 
    slug, 
    priority,
    image_url, 
    accepting_orders,
    description 
FROM cafes 
WHERE slug = 'elicit-2025';
