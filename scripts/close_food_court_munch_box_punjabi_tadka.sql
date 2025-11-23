-- Close accepting_orders for Food Court, Munch Box, and Punjabi Tadka

UPDATE public.cafes
SET accepting_orders = false
WHERE 
  LOWER(name) LIKE '%food court%' OR
  LOWER(name) LIKE '%munch box%' OR
  LOWER(name) LIKE '%punjabi tadka%';

-- Verify the update
SELECT 
  id,
  name,
  accepting_orders,
  is_active,
  location_scope
FROM public.cafes
WHERE 
  LOWER(name) LIKE '%food court%' OR
  LOWER(name) LIKE '%munch box%' OR
  LOWER(name) LIKE '%punjabi tadka%'
ORDER BY name;

-- Show all closed cafes
SELECT 
  COUNT(*) FILTER (WHERE accepting_orders = false) as closed_cafes_count,
  COUNT(*) FILTER (WHERE accepting_orders = true) as open_cafes_count,
  COUNT(*) as total_active_cafes
FROM public.cafes
WHERE is_active = true;

SELECT 'Food Court, Munch Box, and Punjabi Tadka have been closed successfully!' as status;

