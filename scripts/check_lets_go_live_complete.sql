-- Check Let's Go Live complete status
SELECT 
    name,
    priority,
    is_active,
    accepting_orders,
    CASE 
        WHEN is_active = false THEN 'INACTIVE - WILL BE HIDDEN'
        WHEN accepting_orders = false THEN 'NOT ACCEPTING ORDERS'
        WHEN priority > 9 THEN 'PRIORITY TOO HIGH'
        ELSE 'SHOULD BE VISIBLE'
    END as visibility_status
FROM public.cafes 
WHERE name ILIKE '%lets go live%' 
   OR name ILIKE '%let''s go live%'
   OR name ILIKE '%letsgolive%'
   OR name ILIKE '%lets%'
   OR name ILIKE '%go%'
   OR name ILIKE '%live%';
