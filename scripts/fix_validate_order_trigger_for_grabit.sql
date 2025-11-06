-- Fix validate_order_placement trigger to skip accepting_orders check for grocery/Grabit cafes
-- This allows Grabit orders to be placed even if accepting_orders is false

-- Update the validation function to check if cafe is grocery type
CREATE OR REPLACE FUNCTION public.validate_order_placement()
RETURNS TRIGGER AS $$
DECLARE
  cafe_type TEXT;
  cafe_name TEXT;
  cafe_slug TEXT;
BEGIN
  -- Get cafe type, name, and slug
  SELECT type, name, slug INTO cafe_type, cafe_name, cafe_slug
  FROM public.cafes 
  WHERE id = NEW.cafe_id;
  
  -- Skip accepting_orders check for grocery cafes (Grabit, 24 Seven Mart, etc.)
  -- Check by type, name, or slug
  IF NOT (
    cafe_type = 'grocery' OR
    LOWER(cafe_name) LIKE '%grabit%' OR
    LOWER(cafe_name) LIKE '%24 seven%' OR
    LOWER(cafe_name) LIKE '%grocery%' OR
    LOWER(cafe_slug) = 'grabit' OR
    LOWER(cafe_slug) LIKE '%24-seven%' OR
    LOWER(cafe_slug) LIKE '%grocery%'
  ) THEN
    -- Only check accepting_orders for non-grocery cafes
    IF NOT EXISTS (
      SELECT 1 FROM public.cafes 
      WHERE id = NEW.cafe_id 
      AND is_active = true 
      AND accepting_orders = true
    ) THEN
      RAISE EXCEPTION 'Cafe is not currently accepting orders';
    END IF;
  END IF;
  
  -- Check if user exists and is active (always check this)
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'validate_order_placement_trigger'
  ) THEN
    -- Create the trigger if it doesn't exist
    CREATE TRIGGER validate_order_placement_trigger
      BEFORE INSERT ON public.orders
      FOR EACH ROW
      EXECUTE FUNCTION public.validate_order_placement();
    RAISE NOTICE '✅ Created validate_order_placement_trigger';
  ELSE
    RAISE NOTICE '✅ Trigger validate_order_placement_trigger already exists';
  END IF;
END $$;

-- Test the function with a sample check
DO $$
DECLARE
  grabit_cafe_id UUID;
  test_result BOOLEAN;
BEGIN
  -- Get Grabit cafe ID
  SELECT id INTO grabit_cafe_id
  FROM public.cafes 
  WHERE LOWER(name) LIKE '%grabit%' OR LOWER(slug) = 'grabit'
  LIMIT 1;
  
  IF grabit_cafe_id IS NOT NULL THEN
    -- Check if it's detected as grocery
    SELECT 
      CASE 
        WHEN type = 'grocery' OR 
             LOWER(name) LIKE '%grabit%' OR 
             LOWER(slug) = 'grabit' 
        THEN true 
        ELSE false 
      END INTO test_result
    FROM public.cafes 
    WHERE id = grabit_cafe_id;
    
    IF test_result THEN
      RAISE NOTICE '✅ Grabit cafe detected correctly - orders will bypass accepting_orders check';
    ELSE
      RAISE NOTICE '⚠️ Grabit cafe not detected as grocery - please verify cafe type/name/slug';
    END IF;
  ELSE
    RAISE NOTICE '⚠️ Grabit cafe not found in database';
  END IF;
END $$;

