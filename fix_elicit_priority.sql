-- Set ELICIT 2025 to priority 0 to make it first
UPDATE cafes 
SET priority = 0
WHERE slug = 'elicit-2025';

-- Verify the change
SELECT 
    name, 
    priority,
    accepting_orders,
    created_at
FROM cafes 
WHERE name IN ('ELICIT 2025', 'CHATKARA', 'FOOD COURT')
ORDER BY COALESCE(priority, 999) ASC, created_at ASC;
