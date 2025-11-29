-- Set priority to 2 for Amor and New York Pizzeria cafes
-- Priority 2 means they will appear near the top of cafe listings

UPDATE public.cafes 
SET 
  priority = 2,
  updated_at = NOW()
WHERE 
  name ILIKE '%amor%' 
  OR name ILIKE '%new york pizzeria%'
  OR slug = 'amor'
  OR slug = 'new-york-pizzeria';

-- Verify the update
SELECT 
  name,
  slug,
  priority,
  location_scope,
  updated_at,
  CASE 
    WHEN priority = 2 THEN '✅ Priority set to 2'
    ELSE '❌ Priority not updated'
  END as status
FROM public.cafes 
WHERE 
  name ILIKE '%amor%' 
  OR name ILIKE '%new york pizzeria%'
  OR slug = 'amor'
  OR slug = 'new-york-pizzeria'
ORDER BY name;

