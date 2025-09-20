-- Check current status of all cafes
SELECT 
  id,
  name,
  is_active,
  accepting_orders,
  created_at,
  updated_at
FROM public.cafes 
ORDER BY name;