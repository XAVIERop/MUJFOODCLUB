-- Fix all cafes with priority 1-9 to ensure they are visible
-- This will set is_active = true for all priority 1-9 cafes

DO $$
BEGIN
    -- Update Munch Box
    UPDATE public.cafes 
    SET is_active = true, updated_at = NOW()
    WHERE name ILIKE '%munch box%';
    
    -- Update Let's Go Live
    UPDATE public.cafes 
    SET is_active = true, updated_at = NOW()
    WHERE name ILIKE '%lets go live%' 
       OR name ILIKE '%let''s go live%'
       OR name ILIKE '%letsgolive%';
    
    -- Update any other cafes with priority 1-9 that might be inactive
    UPDATE public.cafes 
    SET is_active = true, updated_at = NOW()
    WHERE priority >= 1 AND priority <= 9 AND is_active = false;
    
    RAISE NOTICE 'Fixed visibility for all priority 1-9 cafes!';
END $$;

-- Verify all priority 1-9 cafes are now visible
SELECT 
    name,
    priority,
    is_active,
    accepting_orders,
    CASE 
        WHEN is_active = true AND priority <= 9 THEN '✅ VISIBLE'
        WHEN is_active = false THEN '❌ INACTIVE'
        WHEN priority > 9 THEN '❌ PRIORITY TOO HIGH'
        ELSE '❓ UNKNOWN'
    END as status
FROM public.cafes 
WHERE priority <= 9
ORDER BY priority ASC, name ASC;
