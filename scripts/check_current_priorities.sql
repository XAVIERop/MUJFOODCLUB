-- Check current priorities of all cafes to see what's happening
SELECT 
    name,
    priority,
    is_active,
    accepting_orders,
    created_at
FROM public.cafes 
WHERE priority <= 9
ORDER BY priority ASC, name ASC;
