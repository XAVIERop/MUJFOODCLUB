-- Query to switch on (open) all cafes with priority 7 and below
-- This will set accepting_orders = true for cafes with priority <= 7

UPDATE cafes 
SET 
    accepting_orders = true,
    updated_at = NOW()
WHERE priority <= 7 
  AND is_active = true;

-- Verification query to check which cafes are now open
-- Uncomment the section below to verify the cafes are now accepting orders

/*
SELECT 
    id,
    name,
    priority,
    accepting_orders,
    is_active,
    updated_at
FROM cafes 
WHERE priority <= 7
ORDER BY priority ASC, name;
*/

-- Query to show all cafes and their current status
-- Uncomment the section below to see all cafes and their status

/*
SELECT 
    id,
    name,
    priority,
    accepting_orders,
    is_active,
    created_at,
    updated_at
FROM cafes 
ORDER BY priority ASC, name;
*/

-- Query to show only closed cafes (priority > 7)
-- Uncomment the section below to see which cafes remain closed

/*
SELECT 
    id,
    name,
    priority,
    accepting_orders,
    is_active,
    updated_at
FROM cafes 
WHERE priority > 7
ORDER BY priority ASC, name;
*/
