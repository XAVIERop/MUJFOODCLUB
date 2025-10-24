-- Query to check the priority of Dialog cafe
-- This will show the current priority and status of Dialog cafe

SELECT 
    id,
    name,
    priority,
    is_active,
    accepting_orders,
    created_at,
    updated_at
FROM cafes 
WHERE name ILIKE '%dialog%'
ORDER BY created_at DESC;

-- Alternative query to show all cafes with similar names
-- Uncomment the section below if you want to see all cafes with "dialog" in the name

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
WHERE name ILIKE '%dialog%'
ORDER BY priority ASC, name;
*/

-- Query to show Dialog cafe priority compared to other cafes
-- Uncomment the section below to see Dialog priority in context of all cafes

/*
SELECT 
    id,
    name,
    priority,
    is_active,
    accepting_orders,
    CASE 
        WHEN priority <= 7 THEN 'Visible (Priority ≤ 7)'
        WHEN priority > 7 THEN 'Hidden (Priority > 7)'
        ELSE 'No Priority Set'
    END as visibility_status
FROM cafes 
ORDER BY priority ASC, name;
*/
