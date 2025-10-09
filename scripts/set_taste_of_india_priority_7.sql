-- Query to set the priority of Taste of India cafe to 8
UPDATE public.cafes
SET
    priority = 8,
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

-- Alternative: Update by exact name if you know the exact cafe name
/*
UPDATE public.cafes
SET
    priority = 8,
    updated_at = NOW()
WHERE
    name = 'Taste of India';
*/

-- Alternative: Update by cafe ID if you know the specific ID
/*
UPDATE public.cafes
SET
    priority = 8,
    updated_at = NOW()
WHERE
    id = 'your-cafe-id-here';
*/

-- Verification query: Show all cafes with priority 7 and below (visible cafes)
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
