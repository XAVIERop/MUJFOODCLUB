-- Query to check the current priority of The Crazy Chef cafe
SELECT
    id,
    name,
    priority,
    is_active,
    accepting_orders,
    created_at,
    updated_at
FROM public.cafes
WHERE name ILIKE '%crazy chef%';

-- Alternative query to check all cafes with their priorities
/*
SELECT
    id,
    name,
    priority,
    is_active,
    accepting_orders
FROM public.cafes
ORDER BY priority ASC, name ASC;
*/

-- Query to check if there are multiple cafes with similar names
/*
SELECT
    id,
    name,
    priority,
    is_active,
    accepting_orders
FROM public.cafes
WHERE name ILIKE '%crazy%' OR name ILIKE '%chef%';
*/
