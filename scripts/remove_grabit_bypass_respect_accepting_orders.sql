-- Remove the bypass for Grabit/grocery cafes
-- Now accepting_orders toggle will control orders for ALL cafes including Grabit
-- This allows cafe owners to properly control when orders are accepted

-- Update the validation function to check accepting_orders for ALL cafes
CREATE OR REPLACE FUNCTION public.validate_order_placement()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if cafe is accepting orders (for ALL cafes, including grocery/Grabit)
  IF NOT EXISTS (
    SELECT 1 FROM public.cafes 
    WHERE id = NEW.cafe_id 
    AND is_active = true 
    AND accepting_orders = true
  ) THEN
    RAISE EXCEPTION 'Cafe is not currently accepting orders';
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
    RAISE NOTICE '✅ Trigger validate_order_placement_trigger already exists and has been updated';
  END IF;
END $$;

-- Set Grabit to accepting_orders = true so orders work
-- (Cafe owner can toggle this on/off via the UI)
UPDATE public.cafes 
SET 
  accepting_orders = true,
  updated_at = NOW()
WHERE (LOWER(name) LIKE '%grabit%' OR LOWER(slug) = 'grabit')
  AND accepting_orders = false;

-- Verify the update
SELECT 
  '=== GRABIT STATUS AFTER UPDATE ===' as section,
  id,
  name,
  slug,
  type,
  accepting_orders,
  is_active,
  CASE 
    WHEN accepting_orders = true THEN '✅ Accepting orders (toggle is ON)'
    ELSE '❌ Not accepting orders (toggle is OFF)'
  END as status
FROM public.cafes 
WHERE LOWER(name) LIKE '%grabit%' OR LOWER(slug) = 'grabit';

-- Summary
DO $$
DECLARE
  grabit_count INTEGER;
  accepting_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO grabit_count
  FROM public.cafes 
  WHERE LOWER(name) LIKE '%grabit%' OR LOWER(slug) = 'grabit';
  
  SELECT COUNT(*) INTO accepting_count
  FROM public.cafes 
  WHERE (LOWER(name) LIKE '%grabit%' OR LOWER(slug) = 'grabit')
    AND accepting_orders = true;
  
  RAISE NOTICE '=== SUMMARY ===';
  RAISE NOTICE 'Total Grabit cafes: %', grabit_count;
  RAISE NOTICE 'Grabit cafes accepting orders: %', accepting_count;
  RAISE NOTICE '✅ Trigger updated: accepting_orders now controls orders for ALL cafes including Grabit';
  RAISE NOTICE '✅ Grabit set to accepting_orders = true (can be toggled via UI)';
END $$;

