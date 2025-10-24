-- Query to change Pizza Bakers cafe priority to 7
-- This will update the priority for Pizza Bakers/Crazy Chef cafe

UPDATE cafes 
SET 
    priority = 7,
    updated_at = NOW()
WHERE name ILIKE '%pizza bakers%' 
   OR name ILIKE '%crazy chef%';

-- Verification query to check the updated priority
-- Uncomment the section below to verify the priority change

/*
SELECT 
    id,
    name,
    priority,
    is_active,
    accepting_orders,
    updated_at
FROM cafes 
WHERE name ILIKE '%pizza bakers%' 
   OR name ILIKE '%crazy chef%';
*/

-- Query to show all cafes with priority 7
-- Uncomment the section below to see all cafes with priority 7

/*
SELECT 
    id,
    name,
    priority,
    is_active,
    accepting_orders,
    created_at,
    updated_at
FROM cafes 
WHERE priority = 7
ORDER BY name;
*/
