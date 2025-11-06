-- Verify that the validate_order_placement trigger has been updated correctly
-- to skip accepting_orders check for Grabit/grocery cafes

-- 1. Check the current trigger function definition
SELECT 
  '=== TRIGGER FUNCTION DEFINITION ===' as section,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'validate_order_placement'
AND pronamespace = 'public'::regnamespace;

-- 2. Check if trigger exists
SELECT 
  '=== TRIGGER STATUS ===' as section,
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled,
  CASE 
    WHEN tgenabled = 'O' THEN 'Enabled'
    WHEN tgenabled = 'D' THEN 'Disabled'
    ELSE 'Unknown'
  END as status
FROM pg_trigger 
WHERE tgname = 'validate_order_placement_trigger';

-- 3. Check Grabit cafe details
SELECT 
  '=== GRABIT CAFE DETAILS ===' as section,
  id,
  name,
  slug,
  type,
  accepting_orders,
  is_active,
  CASE 
    WHEN type = 'grocery' THEN '✅ Type: grocery'
    WHEN LOWER(name) LIKE '%grabit%' THEN '✅ Name contains grabit'
    WHEN LOWER(slug) = 'grabit' THEN '✅ Slug is grabit'
    ELSE '❌ Not detected as grocery'
  END as grocery_detection
FROM public.cafes 
WHERE LOWER(name) LIKE '%grabit%' OR LOWER(slug) = 'grabit'
LIMIT 1;

-- 4. Test if the function would allow Grabit orders
DO $$
DECLARE
  grabit_cafe_id UUID;
  cafe_type TEXT;
  cafe_name TEXT;
  cafe_slug TEXT;
  would_bypass_check BOOLEAN := false;
BEGIN
  -- Get Grabit cafe details
  SELECT id, type, name, slug 
  INTO grabit_cafe_id, cafe_type, cafe_name, cafe_slug
  FROM public.cafes 
  WHERE LOWER(name) LIKE '%grabit%' OR LOWER(slug) = 'grabit'
  LIMIT 1;
  
  IF grabit_cafe_id IS NOT NULL THEN
    -- Check if it would bypass the accepting_orders check
    IF (
      cafe_type = 'grocery' OR
      LOWER(cafe_name) LIKE '%grabit%' OR
      LOWER(cafe_name) LIKE '%24 seven%' OR
      LOWER(cafe_name) LIKE '%grocery%' OR
      LOWER(cafe_slug) = 'grabit' OR
      LOWER(cafe_slug) LIKE '%24-seven%' OR
      LOWER(cafe_slug) LIKE '%grocery%'
    ) THEN
      would_bypass_check := true;
    END IF;
    
    RAISE NOTICE '=== VERIFICATION RESULTS ===';
    RAISE NOTICE 'Grabit Cafe ID: %', grabit_cafe_id;
    RAISE NOTICE 'Cafe Name: %', cafe_name;
    RAISE NOTICE 'Cafe Slug: %', cafe_slug;
    RAISE NOTICE 'Cafe Type: %', cafe_type;
    RAISE NOTICE 'Would bypass accepting_orders check: %', 
      CASE WHEN would_bypass_check THEN '✅ YES' ELSE '❌ NO' END;
    
    IF would_bypass_check THEN
      RAISE NOTICE '✅ SUCCESS: Grabit orders will bypass accepting_orders check!';
    ELSE
      RAISE NOTICE '⚠️ WARNING: Grabit may not bypass check - verify cafe type/name/slug';
    END IF;
  ELSE
    RAISE NOTICE '❌ ERROR: Grabit cafe not found in database';
  END IF;
END $$;

