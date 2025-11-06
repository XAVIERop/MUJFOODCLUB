-- Check Grabit cafe priority
SELECT 
    id,
    name,
    slug,
    priority,
    accepting_orders,
    is_active,
    type,
    location,
    hours
FROM public.cafes
WHERE name ILIKE '%grabit%' 
   OR slug = 'grabit'
ORDER BY priority NULLS LAST;

