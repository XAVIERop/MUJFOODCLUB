-- Query to close all cafes
-- This will set accepting_orders = false for all cafes in the system

UPDATE cafes 
SET 
    accepting_orders = false,
    updated_at = NOW()
WHERE is_active = true;

-- Verification query to check the status of all cafes after update
-- Uncomment the section below to verify all cafes are now closed

/*
SELECT 
    id,
    name,
    accepting_orders,
    is_active,
    priority,
    updated_at
FROM cafes 
ORDER BY priority ASC, name;
*/

-- Alternative query to close all cafes regardless of active status
-- Uncomment the section below if you want to close even inactive cafes

/*
UPDATE cafes 
SET 
    accepting_orders = false,
    updated_at = NOW();
*/

-- Query to show only open cafes (if any remain open)
-- Uncomment the section below to see which cafes are still accepting orders

/*
SELECT 
    id,
    name,
    accepting_orders,
    is_active,
    priority,
    updated_at
FROM cafes 
WHERE accepting_orders = true
ORDER BY priority ASC, name;
*/
