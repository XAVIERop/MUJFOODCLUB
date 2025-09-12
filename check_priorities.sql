-- Check current cafe priorities
SELECT 
    name, 
    priority,
    accepting_orders,
    created_at
FROM cafes 
ORDER BY COALESCE(priority, 999) ASC, name ASC;
