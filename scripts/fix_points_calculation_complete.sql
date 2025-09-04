-- Complete fix for points calculation system
-- This will ensure only the ultra-simple points system is active

-- 1. Drop all existing triggers that might be calculating points
DROP TRIGGER IF EXISTS trigger_award_points_on_order_completion ON public.orders;
DROP TRIGGER IF EXISTS order_status_update_trigger ON public.orders;
DROP TRIGGER IF EXISTS handle_order_status_update_trigger ON public.orders;

-- 2. Drop all existing functions that might be calculating points (with CASCADE to handle dependencies)
DROP FUNCTION IF EXISTS award_points_on_order_completion() CASCADE;
DROP FUNCTION IF EXISTS handle_order_status_update() CASCADE;

-- 3. Create the ultra-simple points calculation function
CREATE OR REPLACE FUNCTION calculate_new_points(
    user_id_param UUID,
    order_amount DECIMAL,
    user_tier TEXT DEFAULT 'foodie'
)
RETURNS INTEGER AS $$
DECLARE
    user_profile RECORD;
    base_points INTEGER;
    welcome_bonus INTEGER := 0;
    total_points INTEGER;
BEGIN
    -- Get user profile
    SELECT * INTO user_profile 
    FROM public.profiles 
    WHERE id = user_id_param;
    
    -- Calculate base points based on tier
    CASE user_tier
        WHEN 'foodie' THEN base_points := FLOOR(order_amount * 0.05); -- 5%
        WHEN 'gourmet' THEN base_points := FLOOR(order_amount * 0.05); -- 5%
        WHEN 'connoisseur' THEN base_points := FLOOR(order_amount * 0.10); -- 10%
        ELSE base_points := FLOOR(order_amount * 0.05); -- Default 5%
    END CASE;
    
    -- Add welcome bonus only for new users (50 points)
    IF user_profile.is_new_user = true THEN
        welcome_bonus := 50;
    END IF;
    
    -- Total points = base points + welcome bonus
    total_points := base_points + welcome_bonus;
    
    RETURN total_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create a simple order completion trigger that uses the frontend-calculated points
CREATE OR REPLACE FUNCTION handle_order_completion_simple()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process when order status changes to 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        
        -- Only proceed if there are points to award (from frontend calculation)
        IF COALESCE(NEW.points_earned, 0) > 0 THEN
            BEGIN
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
                    NEW.points_earned,
                    'earned',
                    'Points earned for completing order ' || NEW.order_number,
                    NOW()
                );
                
                -- Update user's total points
                UPDATE public.profiles 
                SET 
                    loyalty_points = COALESCE(loyalty_points, 0) + NEW.points_earned,
                    total_orders = COALESCE(total_orders, 0) + 1,
                    total_spent = COALESCE(total_spent, 0) + NEW.total_amount,
                    updated_at = NOW()
                WHERE id = NEW.user_id;
                
                -- Log successful points award
                RAISE NOTICE 'Awarded % points to user % for order %', 
                    NEW.points_earned, NEW.user_id, NEW.order_number;
                    
            EXCEPTION WHEN OTHERS THEN
                -- Log the error but don't fail the order status update
                RAISE WARNING 'Failed to award points for order %: %', NEW.order_number, SQLERRM;
            END;
        END IF;
    END IF;
    
    -- Always return NEW to allow the order status update to proceed
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create the simple trigger
CREATE TRIGGER order_completion_simple_trigger
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION handle_order_completion_simple();

-- 6. Grant necessary permissions
GRANT EXECUTE ON FUNCTION calculate_new_points(UUID, DECIMAL, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_new_points(UUID, DECIMAL, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION handle_order_completion_simple() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_order_completion_simple() TO service_role;

-- 7. Test the function with your example
-- SELECT calculate_new_points(
--     (SELECT id FROM profiles WHERE email = 'test@muj.manipal.edu'),
--     500,
--     'foodie'
-- );
