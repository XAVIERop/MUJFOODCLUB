-- Find the exact name of Amor cafe
SELECT 
  id,
  name,
  slug,
  delivery_enabled,
  delivery_start_time,
  delivery_end_time,
  delivery_crosses_midnight,
  accepting_orders,
  is_active
FROM public.cafes
WHERE 
  name ILIKE '%amor%' 
  OR slug ILIKE '%amor%'
ORDER BY name;

-- If above returns nothing, show all cafe names
SELECT name FROM public.cafes ORDER BY name;

