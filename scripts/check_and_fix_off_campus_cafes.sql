-- Check which cafes should be off-campus and verify their location_scope

-- 1. Check current off-campus cafes
SELECT 
  id,
  name,
  location_scope,
  accepting_orders,
  is_active
FROM public.cafes
WHERE location_scope = 'off_campus'
ORDER BY name;

-- 2. Check the 4 known outside cafes
SELECT 
  id,
  name,
  location_scope,
  accepting_orders,
  is_active
FROM public.cafes
WHERE 
  LOWER(name) LIKE '%banna%chowki%' OR
  LOWER(name) LIKE '%amor%' OR
  LOWER(name) LIKE '%koko%ro%' OR
  LOWER(name) LIKE '%bg%food%cart%'
ORDER BY name;

-- 3. Set location_scope for the 4 outside cafes
UPDATE public.cafes
SET location_scope = 'off_campus'
WHERE 
  (LOWER(name) LIKE '%banna%' AND LOWER(name) LIKE '%chowki%') OR
  LOWER(name) LIKE '%amor%' OR
  LOWER(name) LIKE '%koko%ro%' OR
  (LOWER(name) LIKE '%bg%' AND LOWER(name) LIKE '%food%cart%');

-- 4. Verify the update
SELECT 
  id,
  name,
  location_scope,
  accepting_orders,
  is_active
FROM public.cafes
WHERE location_scope = 'off_campus'
ORDER BY name;

SELECT 'Off-campus cafes updated successfully!' as status;

