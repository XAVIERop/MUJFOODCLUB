-- Check if Amor cafe has correct location_scope
SELECT 
  id,
  name,
  location_scope,
  accepting_orders,
  is_active
FROM public.cafes
WHERE name = 'Amor';

