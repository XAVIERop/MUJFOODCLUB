-- Check if 24 Seven Mart cafe exists
SELECT 
    id,
    name,
    accepting_orders,
    is_active,
    priority,
    location,
    hours
FROM public.cafes 
WHERE name ILIKE '%24 seven mart%' 
   OR name ILIKE '%24 seven%'
   OR name ILIKE '%24seven%';
