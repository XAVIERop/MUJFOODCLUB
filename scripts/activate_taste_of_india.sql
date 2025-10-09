-- Query to activate Taste of India by setting is_active = true
UPDATE public.cafes
SET
    is_active = true,
    updated_at = NOW()
WHERE
    name ILIKE '%taste of india%';

-- Verification query (uncomment to run after the update)
/*
SELECT
    id,
    name,
    priority,
    is_active,
    accepting_orders,
    updated_at
FROM public.cafes
WHERE name ILIKE '%taste of india%';
*/

-- Alternative: Set both is_active = true AND priority = 7 for full visibility
/*
UPDATE public.cafes
SET
    is_active = true,
    priority = 7,
    updated_at = NOW()
WHERE
    name ILIKE '%taste of india%';
*/

-- Query to check all cafes and their visibility status
/*
SELECT
    id,
    name,
    priority,
    is_active,
    accepting_orders,
    CASE 
        WHEN is_active = false THEN 'HIDDEN (inactive)'
        WHEN priority > 7 THEN 'HIDDEN (priority > 7)'
        ELSE 'VISIBLE'
    END as visibility_status
FROM public.cafes
ORDER BY priority ASC, name ASC;
*/
