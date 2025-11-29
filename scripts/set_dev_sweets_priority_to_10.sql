-- Set priority to 10 for Dev Sweets & Snacks cafe
-- Priority 10 means it will appear in the middle range of cafe listings

UPDATE public.cafes 
SET 
  priority = 10,
  updated_at = NOW()
WHERE 
  name ILIKE '%dev sweets%' 
  OR name ILIKE '%dev%snacks%'
  OR slug ILIKE '%dev-sweets%'
  OR slug ILIKE '%dev%';

-- Verify the update
SELECT 
  name,
  slug,
  priority,
  location_scope,
  accepting_orders,
  updated_at,
  CASE 
    WHEN priority = 10 THEN '✅ Priority set to 10'
    ELSE '❌ Priority not updated'
  END as status
FROM public.cafes 
WHERE 
  name ILIKE '%dev sweets%' 
  OR name ILIKE '%dev%snacks%'
  OR slug ILIKE '%dev-sweets%'
  OR slug ILIKE '%dev%'
ORDER BY name;

