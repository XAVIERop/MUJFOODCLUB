-- Check current cafe priorities to see why they're not ordering correctly
SELECT 
  name, 
  priority, 
  accepting_orders,
  is_active,
  created_at
FROM cafes 
ORDER BY priority ASC, name ASC;
