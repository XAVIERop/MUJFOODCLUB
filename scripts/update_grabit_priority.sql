-- Update Grabit cafe priority to 2
UPDATE public.cafes
SET priority = 2
WHERE id = 'cfa083d5-c030-45e8-9ead-980aaa0aa7d2'
   OR (name ILIKE '%grabit%' AND slug = 'grabit');

-- Verify the update
SELECT 
    id,
    name,
    slug,
    priority,
    accepting_orders,
    is_active,
    type,
    location,
    hours
FROM public.cafes
WHERE id = 'cfa083d5-c030-45e8-9ead-980aaa0aa7d2'
   OR (name ILIKE '%grabit%' AND slug = 'grabit');

