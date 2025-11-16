-- Fix validate_order_placement trigger to allow guest orders (user_id = NULL)
-- This enables guest ordering for Banna's Chowki dine-in orders

-- Drop the existing trigger
DROP TRIGGER IF EXISTS validate_order_placement_trigger ON public.orders;

-- Update the trigger function to skip profile check for guest orders
CREATE OR REPLACE FUNCTION public.validate_order_placement()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if cafe is accepting orders
  IF NOT EXISTS (
    SELECT 1 FROM public.cafes 
    WHERE id = NEW.cafe_id 
    AND is_active = true 
    AND accepting_orders = true
  ) THEN
    RAISE EXCEPTION 'Cafe is not currently accepting orders';
  END IF;
  
  -- Check if user exists and is active (skip check for guest orders where user_id is NULL)
  IF NEW.user_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = NEW.user_id
    ) THEN
      RAISE EXCEPTION 'User profile not found';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER validate_order_placement_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_placement();

-- Verify the trigger was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'validate_order_placement_trigger'
  ) THEN
    RAISE NOTICE '✅ Trigger validate_order_placement_trigger created successfully';
  ELSE
    RAISE WARNING '❌ Trigger validate_order_placement_trigger was not created';
  END IF;
END $$;

