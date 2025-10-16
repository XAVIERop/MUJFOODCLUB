-- Check all cafe statuses to see what might be hidden
SELECT 
    name,
    priority,
    is_active,
    accepting_orders,
    CASE 
        WHEN is_active = false THEN 'INACTIVE'
        WHEN accepting_orders = false THEN 'NOT ACCEPTING ORDERS'
        WHEN priority > 9 THEN 'PRIORITY TOO HIGH'
        ELSE 'SHOULD BE VISIBLE'
    END as visibility_status
FROM public.cafes 
ORDER BY priority ASC, name ASC;
