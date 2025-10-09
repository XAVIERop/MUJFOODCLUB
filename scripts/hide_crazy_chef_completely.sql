-- Query to hide The Crazy Chef completely by setting is_active = false
UPDATE public.cafes
SET
    is_active = false,
    updated_at = NOW()
WHERE
    name ILIKE '%crazy chef%';

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
WHERE name ILIKE '%crazy chef%';
*/

-- Alternative: Set both priority to 8 AND is_active to false
/*
UPDATE public.cafes
SET
    priority = 8,
    is_active = false,
    updated_at = NOW()
WHERE
    name ILIKE '%crazy chef%';
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
