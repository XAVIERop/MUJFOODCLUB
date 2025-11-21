-- Check if Kokoro cafe exists and what its exact name is

SELECT 
  name,
  slug,
  is_active,
  accepting_orders,
  CASE 
    WHEN accepting_orders = true THEN '✅ Currently OPEN'
    ELSE '❌ Currently CLOSED'
  END as status
FROM public.cafes
WHERE LOWER(name) LIKE '%koko%'
   OR LOWER(slug) LIKE '%koko%';

