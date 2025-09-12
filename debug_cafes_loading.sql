-- Debug cafes loading issue
-- Check if cafes exist and are active
SELECT 
    name, 
    priority,
    accepting_orders,
    is_active,
    created_at
FROM cafes 
WHERE is_active = true
ORDER BY COALESCE(priority, 999) ASC, name ASC;

-- Check the get_cafes_ordered function
SELECT * FROM get_cafes_ordered() LIMIT 5;

-- Check if there are any cafes at all
SELECT COUNT(*) as total_cafes FROM cafes;
