-- Query to fix cafe visibility on homepage
-- Set Pizza Bakers to active (is_active = true) and Dialog to inactive (is_active = false)

-- Set Pizza Bakers to active (priority 7, should be visible)
UPDATE cafes 
SET 
    is_active = true,
    updated_at = NOW()
WHERE 
    name ILIKE '%pizza bakers%' OR name ILIKE '%crazy chef%';

-- Set Dialog to inactive (priority 8, should be hidden)
UPDATE cafes 
SET 
    is_active = false,
    updated_at = NOW()
WHERE 
    name ILIKE '%dialog%';

-- Verification query: Check the updated status
SELECT 
    id,
    name,
    priority,
    is_active,
    accepting_orders,
    updated_at
FROM cafes 
WHERE 
    name ILIKE '%pizza bakers%' 
    OR name ILIKE '%crazy chef%' 
    OR name ILIKE '%dialog%'
ORDER BY priority ASC;

-- Alternative verification: Show all cafes with priority <= 8
/*
SELECT 
    id,
    name,
    priority,
    is_active,
    accepting_orders,
    CASE 
        WHEN priority <= 7 AND is_active = true THEN 'Visible on Homepage'
        WHEN priority > 7 OR is_active = false THEN 'Hidden from Homepage'
        ELSE 'Unknown Status'
    END as homepage_status
FROM cafes 
WHERE priority <= 8
ORDER BY priority ASC, name;
*/
