-- Query to update Dialog cafe priority to 8 and Pizza Bakers priority to 7
-- This will change the priority values for these specific cafes

UPDATE cafes 
SET 
    priority = 8,
    updated_at = NOW()
WHERE name ILIKE '%dialog%';

UPDATE cafes 
SET 
    priority = 7,
    updated_at = NOW()
WHERE name ILIKE '%pizza bakers%' 
   OR name ILIKE '%crazy chef%';

-- Verification query to check the updated priorities
-- Uncomment the section below to verify the priority changes

/*
SELECT 
    id,
    name,
    priority,
    is_active,
    accepting_orders,
    updated_at
FROM cafes 
WHERE name ILIKE '%dialog%' 
   OR name ILIKE '%pizza bakers%' 
   OR name ILIKE '%crazy chef%'
ORDER BY priority ASC;
*/

-- Query to show all cafes with their current priorities
-- Uncomment the section below to see all cafe priorities

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
ORDER BY priority ASC, name;
*/