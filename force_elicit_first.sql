-- Force ELICIT 2025 to be first by setting priority to 0
UPDATE cafes 
SET 
    priority = 0,
    accepting_orders = true,
    image_url = '/elicit_cafecard.JPG',
    name = 'ELICIT 2025',
    description = 'ACM ELICIT 2025 Event - Special Menu with Zero Degree Cafe and Dialog'
WHERE slug = 'elicit-2025';

-- Check the updated priorities
SELECT 
    name, 
    priority,
    accepting_orders,
    created_at
FROM cafes 
ORDER BY COALESCE(priority, 999) ASC, name ASC
LIMIT 10;
