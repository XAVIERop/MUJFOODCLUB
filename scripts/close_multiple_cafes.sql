-- Close accepting_orders for Banna's Chowki, Amor, Kokoro, and BG The Food Cart

UPDATE public.cafes
SET accepting_orders = false
WHERE 
  (LOWER(name) LIKE '%banna%' AND LOWER(name) LIKE '%chowki%') OR
  LOWER(name) LIKE '%amor%' OR
  LOWER(name) LIKE '%koko%ro%' OR
  (LOWER(name) LIKE '%bg%' AND LOWER(name) LIKE '%food%cart%');

-- Verify the update
SELECT 
  id,
  name,
  accepting_orders,
  is_active,
  location_scope
FROM public.cafes
WHERE 
  (LOWER(name) LIKE '%banna%' AND LOWER(name) LIKE '%chowki%') OR
  LOWER(name) LIKE '%amor%' OR
  LOWER(name) LIKE '%koko%ro%' OR
  (LOWER(name) LIKE '%bg%' AND LOWER(name) LIKE '%food%cart%')
ORDER BY name;

SELECT 'Cafes closed successfully!' as status;

