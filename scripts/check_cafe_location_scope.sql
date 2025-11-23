-- Check which cafes have location_scope set and what values they have
SELECT 
  id,
  name,
  location_scope,
  is_active,
  accepting_orders
FROM public.cafes
WHERE is_active = true
ORDER BY location_scope NULLS LAST, name;

-- Count cafes by location_scope
SELECT 
  location_scope,
  COUNT(*) as cafe_count
FROM public.cafes
WHERE is_active = true
GROUP BY location_scope;

