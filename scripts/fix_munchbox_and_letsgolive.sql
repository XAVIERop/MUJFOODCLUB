-- Fix Munch Box and Let's Go Live visibility
UPDATE public.cafes 
SET is_active = true, updated_at = NOW()
WHERE name ILIKE '%munch box%' 
   OR name ILIKE '%lets go live%' 
   OR name ILIKE '%let''s go live%'
   OR name ILIKE '%letsgolive%';

-- Verify the fix
SELECT 
    name,
    priority,
    is_active,
    accepting_orders,
    '✅ NOW VISIBLE' as status
FROM public.cafes 
WHERE name ILIKE '%munch box%' 
   OR name ILIKE '%lets go live%' 
   OR name ILIKE '%let''s go live%'
   OR name ILIKE '%letsgolive%'
   OR name ILIKE '%taste of india%'
ORDER BY priority ASC;
