-- Test query to see the exact order being returned
SELECT 
  name, 
  priority, 
  is_active,
  accepting_orders
FROM cafes 
WHERE is_active = true
ORDER BY priority ASC, name ASC
LIMIT 10;
