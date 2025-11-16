-- Set Grabit cafe priority to 20
-- Run in Supabase SQL editor

UPDATE public.cafes
SET priority = 20,
    updated_at = NOW()
WHERE LOWER(name) LIKE '%grabit%'
   OR LOWER(slug) = 'grabit';

-- Verification: confirm Grabit priority is now 20
SELECT id, name, slug, priority
FROM public.cafes
WHERE LOWER(name) LIKE '%grabit%' OR LOWER(slug) = 'grabit';



