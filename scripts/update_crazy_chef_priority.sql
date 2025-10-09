-- Query to update The Crazy Chef priority to 8
-- This will move it to the same priority level as Dialog

UPDATE cafes 
SET 
    priority = 8,
    updated_at = NOW()
WHERE 
    name ILIKE '%crazy chef%';

-- Verification query: Check the updated priority
SELECT 
    id,
    name,
    priority,
    is_active,
    accepting_orders,
    updated_at
FROM cafes 
WHERE 
    name ILIKE '%crazy chef%';

-- Alternative verification: Show all cafes with priority 7 and 8
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
WHERE priority IN (7, 8)
ORDER BY priority ASC, name;
*/
