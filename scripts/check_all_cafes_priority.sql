-- Check priority and status of all cafes
SELECT 
    id,
    name,
    priority,
    is_active,
    accepting_orders,
    created_at,
    updated_at
FROM public.cafes 
ORDER BY 
    priority ASC,
    name ASC;
