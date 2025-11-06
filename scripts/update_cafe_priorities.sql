-- Update cafe priorities:
-- Stardom -> 11
-- Let's Go Live -> 12
-- Momos Cart -> 13

UPDATE public.cafes
SET priority = 11
WHERE name ILIKE '%stardom%' 
   OR slug ILIKE '%stardom%';

UPDATE public.cafes
SET priority = 12
WHERE name ILIKE '%let%go%live%' 
   OR name ILIKE '%lets%go%live%'
   OR slug ILIKE '%lets-go-live%'
   OR slug ILIKE '%letsgolive%';

UPDATE public.cafes
SET priority = 13
WHERE name ILIKE '%momos%cart%'
   OR slug ILIKE '%momos-cart%';

-- Verify the updates
SELECT 
    id,
    name,
    slug,
    priority,
    accepting_orders,
    is_active,
    type,
    location
FROM public.cafes
WHERE name ILIKE '%stardom%' 
   OR name ILIKE '%let%go%live%'
   OR name ILIKE '%lets%go%live%'
   OR name ILIKE '%momos%cart%'
ORDER BY priority;
