-- Query to close Taste of India, Dialog, and Let's Go Live cafes
-- This will set accepting_orders to false for these specific cafes

UPDATE cafes 
SET 
    accepting_orders = false,
    updated_at = NOW()
WHERE name ILIKE '%taste of india%' 
   OR name ILIKE '%dialog%' 
   OR name ILIKE '%lets go live%'
   OR name ILIKE '%let''s go live%';

-- Verification query to check the status of these cafes after update
-- Uncomment the section below to verify the cafes are now closed

/*
SELECT 
    id,
    name,
    accepting_orders,
    is_active,
    updated_at
FROM cafes 
WHERE name ILIKE '%taste of india%' 
   OR name ILIKE '%dialog%' 
   OR name ILIKE '%lets go live%'
   OR name ILIKE '%let''s go live%'
ORDER BY name;
*/

-- Alternative query to close by exact cafe names (if you know the exact names)
-- Uncomment the section below if you want to use exact names

/*
UPDATE cafes 
SET 
    accepting_orders = false,
    updated_at = NOW()
WHERE name IN ('Taste of India', 'Dialog', 'Let''s Go Live');
*/
