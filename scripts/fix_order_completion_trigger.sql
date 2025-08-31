-- Fix order completion trigger to prevent status update failures
-- This script improves error handling and ensures the trigger doesn't block order status updates

-- First, drop the existing trigger and function
DROP TRIGGER IF EXISTS trigger_award_points_on_order_completion ON orders;
DROP FUNCTION IF EXISTS award_points_on_order_completion();

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION award_points_on_order_completion()
RETURNS TRIGGER AS $$
DECLARE
    user_profile RECORD;
    points_to_award INTEGER;
    new_total_points INTEGER;
BEGIN
    -- Only proceed if status changed to 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        
        -- Get user profile information
        SELECT * INTO user_profile 
        FROM profiles 
        WHERE id = NEW.user_id;
        
        -- Calculate points to award (1 point per ₹4 spent)
        points_to_award := FLOOR(NEW.total_amount / 4);
        
        -- Ensure points_to_award is not negative
        IF points_to_award < 0 THEN
            points_to_award := 0;
        END IF;
        
        -- Only proceed if there are points to award
        IF points_to_award > 0 THEN
            BEGIN
                -- Create loyalty transaction record
                INSERT INTO loyalty_transactions (
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
                    'Points earned for completing order ' || NEW.order_number,
                    NOW()
                );
                
                -- Update user's total points
                new_total_points := COALESCE(user_profile.loyalty_points, 0) + points_to_award;
                
                UPDATE profiles 
                SET 
                    loyalty_points = new_total_points,
                    total_orders = COALESCE(total_orders, 0) + 1,
                    total_spent = COALESCE(total_spent, 0) + NEW.total_amount,
                    updated_at = NOW()
                WHERE id = NEW.user_id;
                
                -- Log successful points award
                RAISE NOTICE 'Successfully awarded % points to user % for order %', 
                    points_to_award, NEW.user_id, NEW.order_number;
                    
            EXCEPTION WHEN OTHERS THEN
                -- Log the error but don't fail the order status update
                RAISE WARNING 'Failed to award points for order %: %', NEW.order_number, SQLERRM;
                -- Continue execution - don't let points failure block order completion
            END;
        END IF;
    END IF;
    
    -- Always return NEW to allow the order status update to proceed
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION award_points_on_order_completion() TO authenticated;
GRANT EXECUTE ON FUNCTION award_points_on_order_completion() TO service_role;

-- Recreate the trigger
CREATE TRIGGER trigger_award_points_on_order_completion
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION award_points_on_order_completion();

-- Verify the trigger is created
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_award_points_on_order_completion';
