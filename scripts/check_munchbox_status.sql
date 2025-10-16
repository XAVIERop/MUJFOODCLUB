-- Check Munch Box cafe status and priority
SELECT 
    name,
    priority,
    is_active,
    accepting_orders,
    created_at,
    updated_at
FROM public.cafes 
WHERE name ILIKE '%munch box%'
   OR name ILIKE '%munchbox%';
