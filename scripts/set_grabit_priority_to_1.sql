-- Set Grabit cafe priority to 1 (highest priority)
UPDATE public.cafes 
SET 
    priority = 1,
    updated_at = NOW()
WHERE LOWER(name) LIKE '%grabit%' OR slug = 'grabit';

-- Verify the update
SELECT 
    id,
    name,
    slug,
    priority,
    updated_at
FROM public.cafes 
WHERE LOWER(name) LIKE '%grabit%' OR slug = 'grabit';

SELECT '✅ Grabit priority set to 1 successfully!' as status;

