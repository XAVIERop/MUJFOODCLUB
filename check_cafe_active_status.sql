-- Check cafe active status and priority values
SELECT 
  name, 
  priority, 
  accepting_orders,
  is_active,
  CASE 
    WHEN is_active IS NULL THEN 'NULL'
    WHEN is_active = true THEN 'TRUE'
    WHEN is_active = false THEN 'FALSE'
  END as active_status
FROM cafes 
ORDER BY 
  CASE WHEN is_active IS NULL OR is_active = false THEN 1 ELSE 0 END,
  priority ASC, 
  name ASC;
