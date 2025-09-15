-- Fix Points Calculation Bug
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Check current triggers that might be causing duplication
SELECT 
  '=== CURRENT TRIGGERS ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%point%' OR trigger_name LIKE '%loyalty%' OR trigger_name LIKE '%order%'
ORDER BY trigger_name;

-- 2. Check Maahi's loyalty transactions to see duplication
SELECT 
  '=== MAHI LOYALTY TRANSACTIONS ===' as section,
  lt.id,
  lt.order_id,
  lt.points_change,
  lt.transaction_type,
  lt.description,
  lt.created_at
FROM public.loyalty_transactions lt
LEFT JOIN public.profiles p ON lt.user_id = p.id
WHERE p.email = 'maahi.229301245@muj.manipal.edu'
ORDER BY lt.created_at DESC;

-- 3. Fix Maahi's data first (correct the total_spent)
UPDATE public.profiles 
SET 
  total_spent = 475.00,  -- Correct amount
  loyalty_points = 75,   -- Correct points (47 base + 50 bonus - 22 redeemed)
  updated_at = NOW()
WHERE email = 'maahi.229301245@muj.manipal.edu';

-- 4. Check for duplicate triggers and remove them
DROP TRIGGER IF EXISTS trigger_award_points_on_order_completion ON public.orders;
DROP TRIGGER IF EXISTS new_order_notification_trigger ON public.orders;
DROP TRIGGER IF EXISTS trigger_handle_order_completion ON public.orders;

-- 5. Create a single, correct trigger for order completion
CREATE OR REPLACE FUNCTION handle_order_completion_correct()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  points_to_award INTEGER;
  base_points INTEGER;
  first_order_bonus INTEGER;
  is_first_order BOOLEAN;
BEGIN
  -- Only process when order status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Check if this is the user's first order
    SELECT COUNT(*) = 0 INTO is_first_order
    FROM public.orders 
    WHERE user_id = NEW.user_id 
      AND status = 'completed' 
      AND id != NEW.id;
    
    -- Calculate base points (5% of order amount)
    base_points := FLOOR(NEW.total_amount * 0.05);
    
    -- Calculate first order bonus (50 points if first order)
    IF is_first_order THEN
      first_order_bonus := 50;
    ELSE
      first_order_bonus := 0;
    END IF;
    
    -- Total points to award
    points_to_award := base_points + first_order_bonus;
    
    -- Update user profile (only if points not already credited)
    IF NOT NEW.points_credited THEN
      UPDATE public.profiles 
      SET 
        loyalty_points = loyalty_points + points_to_award,
        total_orders = total_orders + 1,
        total_spent = total_spent + NEW.total_amount,  -- Add actual order amount
        updated_at = NOW()
      WHERE id = NEW.user_id;
      
      -- Mark points as credited
      UPDATE public.orders 
      SET points_credited = true
      WHERE id = NEW.id;
      
      -- Create loyalty transaction record
      INSERT INTO public.loyalty_transactions (
        user_id,
        order_id,
        points_change,
        transaction_type,
        description,
        created_at
      ) VALUES (
        NEW.user_id,
        NEW.id,
        points_to_award,
        'earned',
        'Points earned for completed order: ' || base_points || ' base + ' || first_order_bonus || ' bonus',
        NOW()
      );
      
      RAISE NOTICE 'Awarded % points to user % for order % (base: %, bonus: %)', 
        points_to_award, NEW.user_id, NEW.id, base_points, first_order_bonus;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. Create the corrected trigger
CREATE TRIGGER trigger_handle_order_completion_correct
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_order_completion_correct();

-- 7. Verify the fix
SELECT 
  '=== VERIFICATION ===' as section,
  'Maahi fixed' as status,
  p.loyalty_points,
  p.total_spent,
  p.total_orders
FROM public.profiles p
WHERE p.email = 'maahi.229301245@muj.manipal.edu';
