-- Fix the points trigger function
-- This will replace the problematic function with a corrected version

-- 1. Drop the existing function and trigger
DROP TRIGGER IF EXISTS trigger_award_points_on_order_completion ON public.orders;
DROP FUNCTION IF EXISTS award_points_on_order_completion() CASCADE;

-- 2. Create the corrected function
CREATE OR REPLACE FUNCTION award_points_on_order_completion()
RETURNS TRIGGER AS $$
DECLARE
    points_to_award INTEGER;
    user_profile RECORD;
BEGIN
    -- Only process when order status changes to 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        
        -- Get user profile information
        SELECT * INTO user_profile 
        FROM public.profiles 
        WHERE id = NEW.user_id;
        
        IF user_profile IS NULL THEN
            RAISE WARNING 'User profile not found for user_id: %', NEW.user_id;
            RETURN NEW;
        END IF;
        
        -- Get points to award from the order
        points_to_award := COALESCE(NEW.points_earned, 0);
        
        IF points_to_award > 0 THEN
            BEGIN
                -- Create loyalty transaction for points earned
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
                    'Points earned for completed order ' || COALESCE(NEW.order_number, NEW.id::text),
                    NOW()
                );
                
                -- Update user profile to add earned points
                UPDATE public.profiles 
                SET 
                    loyalty_points = COALESCE(loyalty_points, 0) + points_to_award,
                    total_orders = COALESCE(total_orders, 0) + 1,
                    total_spent = COALESCE(total_spent, 0) + COALESCE(NEW.total_amount, 0),
                    updated_at = NOW()
                WHERE id = NEW.user_id;
                
                -- Log the points award
                RAISE NOTICE 'Awarded % points to user % for completed order %', 
                    points_to_award, NEW.user_id, COALESCE(NEW.order_number, NEW.id::text);
                    
            EXCEPTION WHEN OTHERS THEN
                -- Log the error but don't fail the order update
                RAISE WARNING 'Error awarding points for order %: %', NEW.id, SQLERRM;
                RETURN NEW;
            END;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the trigger
CREATE TRIGGER trigger_award_points_on_order_completion
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION award_points_on_order_completion();

-- 4. Grant necessary permissions
GRANT EXECUTE ON FUNCTION award_points_on_order_completion() TO authenticated;

-- 5. Verify the trigger is created
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_award_points_on_order_completion';
