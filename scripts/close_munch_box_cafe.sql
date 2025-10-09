-- Close Munch Box Cafe
UPDATE public.cafes 
SET 
    accepting_orders = false,
    is_active = false
WHERE name ILIKE '%munch box%' 
   OR name ILIKE '%munchbox%';

-- Verify the update
SELECT 
    id,
    name,
    accepting_orders,
    is_active,
    priority
FROM public.cafes 
WHERE name ILIKE '%munch box%' 
   OR name ILIKE '%munchbox%';
