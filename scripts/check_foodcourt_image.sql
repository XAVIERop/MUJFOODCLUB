-- Check FOOD COURT cafe image_url in database
SELECT 
    name,
    image_url,
    slug,
    type
FROM cafes 
WHERE name ILIKE '%food%court%' 
   OR name ILIKE '%foodcourt%'
   OR name ILIKE '%FOOD%COURT%'
ORDER BY name;
