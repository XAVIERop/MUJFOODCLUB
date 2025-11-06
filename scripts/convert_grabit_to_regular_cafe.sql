-- Convert Grabit from grocery type to regular cafe type
-- This will make Grabit behave exactly like any other cafe

-- 1. Update Grabit's type from 'grocery' to 'restaurant' (or 'multi-cuisine')
UPDATE public.cafes 
SET 
  type = 'restaurant',
  updated_at = NOW()
WHERE (LOWER(name) LIKE '%grabit%' OR LOWER(slug) = 'grabit')
  AND type = 'grocery';

-- 2. Verify the update
SELECT 
  '=== GRABIT AFTER CONVERSION ===' as section,
  id,
  name,
  slug,
  type,
  accepting_orders,
  is_active,
  CASE 
    WHEN type = 'grocery' THEN '❌ Still grocery'
    WHEN type = 'restaurant' THEN '✅ Now restaurant'
    ELSE '⚠️ Type: ' || type
  END as conversion_status
FROM public.cafes 
WHERE LOWER(name) LIKE '%grabit%' OR LOWER(slug) = 'grabit';

-- Summary
DO $$
DECLARE
  grabit_count INTEGER;
  converted_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO grabit_count
  FROM public.cafes 
  WHERE LOWER(name) LIKE '%grabit%' OR LOWER(slug) = 'grabit';
  
  SELECT COUNT(*) INTO converted_count
  FROM public.cafes 
  WHERE (LOWER(name) LIKE '%grabit%' OR LOWER(slug) = 'grabit')
    AND type = 'restaurant';
  
  RAISE NOTICE '=== CONVERSION SUMMARY ===';
  RAISE NOTICE 'Total Grabit cafes: %', grabit_count;
  RAISE NOTICE 'Converted to restaurant: %', converted_count;
  
  IF converted_count > 0 THEN
    RAISE NOTICE '✅ Grabit is now a regular cafe!';
    RAISE NOTICE '✅ It will be treated exactly like any other cafe';
  ELSE
    RAISE NOTICE '⚠️ Conversion may have failed - check manually';
  END IF;
END $$;

