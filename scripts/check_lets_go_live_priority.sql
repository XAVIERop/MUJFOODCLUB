-- Check the priority of "Let's Go Live" cafe
SELECT 
    id,
    name,
    priority,
    is_active,
    accepting_orders,
    created_at
FROM public.cafes 
WHERE name ILIKE '%lets go live%' 
   OR name ILIKE '%let''s go live%'
   OR name ILIKE '%letsgolive%'
ORDER BY name;
