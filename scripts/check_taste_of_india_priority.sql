-- Query to check the priority of Taste of India cafe
SELECT
    id,
    name,
    priority,
    is_active,
    accepting_orders,
    created_at,
    updated_at
FROM public.cafes
WHERE name ILIKE '%taste of india%';

-- Alternative query to show all cafes with their priorities for comparison
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

-- Alternative query to show only cafes with priority 7 and below (visible cafes)
/*
SELECT
    id,
    name,
    priority,
    is_active,
    accepting_orders
FROM public.cafes
WHERE priority <= 7
ORDER BY priority ASC, name ASC;
*/

-- Alternative query to show only cafes with priority above 7 (hidden cafes)
/*
SELECT
    id,
    name,
    priority,
    is_active,
    accepting_orders
FROM public.cafes
WHERE priority > 7
ORDER BY priority ASC, name ASC;
*/
