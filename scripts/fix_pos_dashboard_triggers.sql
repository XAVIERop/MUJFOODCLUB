-- Fix POS Dashboard order status issues
-- This script addresses potential trigger conflicts and ensures proper order status handling

-- 1. First, let's check what triggers currently exist on the orders table
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
ORDER BY trigger_name;

-- 2. Drop any potentially conflicting triggers
DROP TRIGGER IF EXISTS order_status_update_trigger ON public.orders;
DROP TRIGGER IF EXISTS trigger_award_points_on_order_completion ON public.orders;
DROP TRIGGER IF EXISTS queue_management_trigger ON public.orders;

-- 3. Create a single, comprehensive trigger function that handles all order status updates
CREATE OR REPLACE FUNCTION public.handle_order_status_update_comprehensive()
RETURNS TRIGGER AS $$
DECLARE
    user_profile RECORD;
    points_to_award INTEGER;
BEGIN
    -- Only proceed if status actually changed
    IF NEW.status = OLD.status THEN
        RETURN NEW;
    END IF;

    -- Update status_updated_at timestamp
    NEW.status_updated_at = now();

    -- Handle specific status transitions with timestamps
    CASE NEW.status
        WHEN 'confirmed' THEN
            NEW.accepted_at = now();
        WHEN 'preparing' THEN
            NEW.preparing_at = now();
        WHEN 'on_the_way' THEN
            NEW.out_for_delivery_at = now();
        WHEN 'completed' THEN
            NEW.completed_at = now();
            
            -- Only credit points if not already credited
            IF NOT NEW.points_credited AND NEW.points_earned > 0 THEN
                -- Get user profile
                SELECT * INTO user_profile 
                FROM profiles 
                WHERE id = NEW.user_id;
                
                -- Calculate points (1 point per ₹4 spent)
                points_to_award := FLOOR(NEW.total_amount / 4);
                IF points_to_award < 0 THEN
                    points_to_award := 0;
                END IF;
                
                -- Award points if there are any to award
                IF points_to_award > 0 THEN
                    BEGIN
                        -- Create loyalty transaction
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
                        
                        -- Update user profile
                        UPDATE profiles 
                        SET 
                            loyalty_points = COALESCE(loyalty_points, 0) + points_to_award,
                            total_orders = COALESCE(total_orders, 0) + 1,
                            total_spent = COALESCE(total_spent, 0) + NEW.total_amount,
                            updated_at = NOW()
                        WHERE id = NEW.user_id;
                        
                        -- Mark points as credited
                        NEW.points_credited = true;
                        
                        RAISE NOTICE 'Successfully awarded % points to user % for order %', 
                            points_to_award, NEW.user_id, NEW.order_number;
                            
                    EXCEPTION WHEN OTHERS THEN
                        RAISE WARNING 'Failed to award points for order %: %', NEW.order_number, SQLERRM;
                        -- Don't fail the order update if points fail
                    END;
                END IF;
            END IF;
    END CASE;

    -- Create notification for status change
    INSERT INTO order_notifications (
        order_id,
        cafe_id,
        user_id,
        notification_type,
        message,
        created_at
    ) VALUES (
        NEW.id,
        NEW.cafe_id,
        NEW.user_id,
        'status_update',
        'Order #' || NEW.order_number || ' status updated to: ' || NEW.status,
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create the comprehensive trigger
CREATE TRIGGER order_status_update_comprehensive_trigger
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.handle_order_status_update_comprehensive();

-- 5. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_order_status_update_comprehensive() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_order_status_update_comprehensive() TO service_role;

-- 6. Verify the trigger is created
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'order_status_update_comprehensive_trigger';

-- 7. Test the trigger with a sample update (commented out for safety)
-- UPDATE orders SET status = 'confirmed' WHERE id = 'some-order-id';

COMMIT;
