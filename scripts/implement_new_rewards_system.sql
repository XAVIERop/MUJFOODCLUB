-- =====================================================
-- PHASE 2: Implement New Cafe-Specific Rewards System
-- =====================================================
-- This script implements the new unified rewards system

-- 1. Create function to calculate cafe-specific tier
CREATE OR REPLACE FUNCTION calculate_cafe_tier(spent_last_30_days DECIMAL(10,2))
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    IF spent_last_30_days >= 6500 THEN
        RETURN 'connoisseur';
    ELSIF spent_last_30_days >= 3500 THEN
        RETURN 'gourmet';
    ELSE
        RETURN 'foodie';
    END IF;
END;
$$;

-- 2. Create function to get tier discount percentage
CREATE OR REPLACE FUNCTION get_tier_discount(tier TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
    CASE tier
        WHEN 'connoisseur' THEN RETURN 10;
        WHEN 'gourmet' THEN RETURN 7;
        ELSE RETURN 0; -- foodie
    END CASE;
END;
$$;

-- 3. Create function to calculate points earned (5% of final amount)
CREATE OR REPLACE FUNCTION calculate_points_earned(final_amount DECIMAL(10,2))
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN FLOOR(final_amount * 0.05);
END;
$$;

-- 4. Create function to handle order completion with new rewards system
CREATE OR REPLACE FUNCTION handle_new_rewards_order_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_tier TEXT;
    tier_discount INTEGER;
    final_amount DECIMAL(10,2);
    points_earned INTEGER;
    is_first_order BOOLEAN;
    last_30_days_spent DECIMAL(10,2);
BEGIN
    -- Only process when order status changes to 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        
        -- Check if this is first order at this cafe
        SELECT COUNT(*) = 0 INTO is_first_order
        FROM public.orders
        WHERE user_id = NEW.user_id 
          AND cafe_id = NEW.cafe_id 
          AND status = 'completed'
          AND id != NEW.id;
        
        -- Calculate spending in last 30 days
        SELECT COALESCE(SUM(total_amount), 0) INTO last_30_days_spent
        FROM public.orders
        WHERE user_id = NEW.user_id 
          AND cafe_id = NEW.cafe_id 
          AND status = 'completed'
          AND created_at >= NOW() - INTERVAL '30 days'
          AND id != NEW.id;
        
        -- Add current order amount
        last_30_days_spent := last_30_days_spent + NEW.total_amount;
        
        -- Determine current tier
        current_tier := calculate_cafe_tier(last_30_days_spent);
        tier_discount := get_tier_discount(current_tier);
        
        -- Calculate final amount after discount
        final_amount := NEW.total_amount - (NEW.total_amount * tier_discount / 100);
        
        -- Calculate points earned (5% of final amount)
        points_earned := calculate_points_earned(final_amount);
        
        -- Add first order bonus if applicable
        IF is_first_order THEN
            points_earned := points_earned + 50;
        END IF;
        
        -- Update or create cafe loyalty points record
        INSERT INTO public.cafe_loyalty_points (
            user_id,
            cafe_id,
            points,
            total_spent,
            loyalty_level,
            first_order_bonus_awarded,
            monthly_spend_30_days,
            current_tier,
            updated_at
        ) VALUES (
            NEW.user_id,
            NEW.cafe_id,
            points_earned,
            NEW.total_amount,
            1, -- Default level for now
            is_first_order,
            last_30_days_spent,
            current_tier,
            NOW()
        ) ON CONFLICT (user_id, cafe_id) DO UPDATE SET
            points = cafe_loyalty_points.points + points_earned,
            total_spent = cafe_loyalty_points.total_spent + NEW.total_amount,
            monthly_spend_30_days = last_30_days_spent,
            current_tier = current_tier,
            updated_at = NOW();
        
        -- Record transaction
        INSERT INTO public.cafe_loyalty_transactions (
            user_id,
            cafe_id,
            order_id,
            points_change,
            transaction_type,
            description,
            created_at
        ) VALUES (
            NEW.user_id,
            NEW.cafe_id,
            NEW.id,
            points_earned,
            CASE WHEN is_first_order THEN 'first_order_bonus' ELSE 'earned' END,
            CASE 
                WHEN is_first_order THEN 'First order bonus + points: ' || points_earned
                ELSE 'Points earned: ' || points_earned || ' (5% of ₹' || final_amount || ')'
            END,
            NOW()
        );
        
        RAISE NOTICE 'New rewards system: User %, Cafe %, Tier %, Points %, Final Amount %', 
            NEW.user_id, NEW.cafe_id, current_tier, points_earned, final_amount;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 5. Create the new trigger
DROP TRIGGER IF EXISTS new_rewards_order_completion_trigger ON public.orders;
CREATE TRIGGER new_rewards_order_completion_trigger
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_rewards_order_completion();

-- 6. Add new columns to cafe_loyalty_points table if they don't exist
ALTER TABLE public.cafe_loyalty_points 
ADD COLUMN IF NOT EXISTS monthly_spend_30_days DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_tier TEXT DEFAULT 'foodie';

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION calculate_cafe_tier TO authenticated;
GRANT EXECUTE ON FUNCTION get_tier_discount TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_points_earned TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_rewards_order_completion TO authenticated;

-- 8. Add comments
COMMENT ON FUNCTION calculate_cafe_tier IS 'Calculates tier based on 30-day spending: foodie(<3500), gourmet(3500-6499), connoisseur(6500+)';
COMMENT ON FUNCTION get_tier_discount IS 'Returns discount percentage for tier: foodie(0%), gourmet(7%), connoisseur(10%)';
COMMENT ON FUNCTION calculate_points_earned IS 'Calculates 5% points of final amount';
COMMENT ON FUNCTION handle_new_rewards_order_completion IS 'Handles order completion with new cafe-specific rewards system';
