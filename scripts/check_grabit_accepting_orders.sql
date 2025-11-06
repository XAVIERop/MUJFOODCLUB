-- Check if Grabit is accepting orders
SELECT 
  id,
  name,
  slug,
  accepting_orders,
  is_active,
  priority,
  location,
  hours,
  CASE 
    WHEN accepting_orders = true AND is_active = true THEN '✅ Accepting orders'
    WHEN accepting_orders = false THEN '❌ Not accepting orders'
    WHEN is_active = false THEN '⚠️ Cafe is inactive'
    ELSE '❓ Unknown status'
  END as status
FROM public.cafes 
WHERE slug = 'grabit' 
   OR name ILIKE '%grabit%'
ORDER BY created_at DESC
LIMIT 1;

