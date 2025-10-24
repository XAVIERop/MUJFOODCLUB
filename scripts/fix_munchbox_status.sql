-- Fix Munch Box status to make it visible
UPDATE public.cafes 
SET is_active = true, updated_at = NOW()
WHERE name ILIKE '%munch box%';

-- Verify the fix
SELECT 
    name,
    priority,
    is_active,
    accepting_orders,
    'SHOULD NOW BE VISIBLE' as status
FROM public.cafes 
WHERE name ILIKE '%munch box%';
