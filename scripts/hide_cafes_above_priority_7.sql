-- Query to hide cafes with priority above 7
-- This will set is_active = false for cafes with priority > 7
-- Cafes with priority <= 7 will remain visible

UPDATE cafes 
SET 
    is_active = false,
    updated_at = NOW()
WHERE priority > 7;

-- Verification query to check which cafes are now hidden/visible
-- Uncomment the section below to see the current status of all cafes

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

-- Query to show only the visible cafes (priority <= 7)
-- Uncomment the section below to see which cafes will remain visible

/*
SELECT 
    id,
    name,
    priority,
    is_active,
    accepting_orders,
    created_at
FROM cafes 
WHERE priority <= 7
ORDER BY priority ASC, name;
*/

-- Query to show which cafes will be hidden (priority > 7)
-- Uncomment the section below to see which cafes will be hidden

/*
SELECT 
    id,
    name,
    priority,
    is_active,
    accepting_orders,
    created_at
FROM cafes 
WHERE priority > 7
ORDER BY priority ASC, name;
*/
