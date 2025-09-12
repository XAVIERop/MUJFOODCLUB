-- Debug ELICIT 2025 image issue
SELECT 
    id,
    name, 
    slug, 
    image_url, 
    accepting_orders,
    description 
FROM cafes 
WHERE slug = 'elicit-2025';

-- Update with absolute path and force refresh
UPDATE cafes 
SET 
    image_url = '/elicit_cafecard.JPG',
    accepting_orders = true,
    name = 'ELICIT 2025',
    description = 'ACM ELICIT 2025 Event - Special Menu with Zero Degree Cafe and Dialog'
WHERE slug = 'elicit-2025';

-- Check if the file exists in public folder (this will show if the path is correct)
SELECT 'Image path should be: /elicit_cafecard.JPG' as image_info;
