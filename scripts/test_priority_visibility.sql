-- Test query to check if priority 8-9 cafes exist and are active
SELECT 
    name,
    priority,
    is_active,
    accepting_orders
FROM public.cafes 
WHERE (name ILIKE '%taste of india%' OR name ILIKE '%lets go live%' OR name ILIKE '%let''s go live%')
ORDER BY priority ASC;
