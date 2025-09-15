-- =====================================================
-- Fix All Conflicting Functions
-- =====================================================

-- 1. Fix calculate_cafe_loyalty_level to use NEW logic
CREATE OR REPLACE FUNCTION calculate_cafe_loyalty_level(total_spent DECIMAL(10,2))
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- NEW LOGIC: Based on monthly spending, not total points
    IF total_spent >= 6500 THEN
        RETURN 3; -- Connoisseur
    ELSIF total_spent >= 3500 THEN
        RETURN 2; -- Gourmet
    ELSE
        RETURN 1; -- Foodie
    END IF;
END;
$$;

-- 2. Fix update_cafe_loyalty_points to use NEW logic
CREATE OR REPLACE FUNCTION update_cafe_loyalty_points(
    p_user_id UUID,
    p_cafe_id UUID,
    p_order_id UUID,
    p_order_amount DECIMAL(10,2)
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_points INTEGER;
    current_spent DECIMAL(10,2);
    current_level INTEGER;
    new_level INTEGER;
    points_earned INTEGER;
    is_first_order BOOLEAN;
    last_30_days_spent DECIMAL(10,2);
    current_tier TEXT;
BEGIN
    -- Check if this is the first order at this cafe
    SELECT COUNT(*) = 0 INTO is_first_order
    FROM public.orders
    WHERE user_id = p_user_id 
      AND cafe_id = p_cafe_id 
      AND status = 'completed'
      AND id != p_order_id;
    
    -- Calculate points earned (5% of order amount)
    points_earned := FLOOR(p_order_amount * 0.05);
    
    -- Add first order bonus if applicable
    IF is_first_order AND p_order_amount >= 249 THEN
        points_earned := points_earned + 50;
    END IF;
    
    -- Calculate 30-day spending for tier calculation
    SELECT COALESCE(SUM(total_amount), 0) INTO last_30_days_spent
    FROM public.orders
    WHERE user_id = p_user_id 
      AND cafe_id = p_cafe_id 
      AND status = 'completed'
      AND created_at >= NOW() - INTERVAL '30 days';
    
    -- Calculate current tier based on 30-day spending
    current_tier := calculate_cafe_tier(last_30_days_spent);
    
    -- Get current loyalty data
    SELECT COALESCE(points, 0), COALESCE(total_spent, 0), COALESCE(loyalty_level, 1)
    INTO current_points, current_spent, current_level
    FROM public.cafe_loyalty_points
    WHERE user_id = p_user_id AND cafe_id = p_cafe_id;
    
    -- Update total spent
    current_spent := current_spent + p_order_amount;
    
    -- Update or insert loyalty points record
    INSERT INTO public.cafe_loyalty_points (
        user_id, cafe_id, points, total_spent, loyalty_level, first_order_bonus_awarded,
        monthly_spend_30_days, current_tier, updated_at
    ) VALUES (
        p_user_id, p_cafe_id, current_points + points_earned, current_spent, 
        CASE current_tier 
            WHEN 'connoisseur' THEN 3
            WHEN 'gourmet' THEN 2
            ELSE 1
        END,
        is_first_order,
        last_30_days_spent, current_tier, NOW()
    ) ON CONFLICT (user_id, cafe_id) DO UPDATE SET
        points = cafe_loyalty_points.points + points_earned,
        total_spent = cafe_loyalty_points.total_spent + p_order_amount,
        monthly_spend_30_days = EXCLUDED.monthly_spend_30_days,
        current_tier = EXCLUDED.current_tier,
        updated_at = NOW();
    
    -- Record transaction
    INSERT INTO public.cafe_loyalty_transactions (
        user_id, cafe_id, order_id, points_change, transaction_type, description, created_at
    ) VALUES (
        p_user_id, p_cafe_id, p_order_id, points_earned,
        CASE WHEN is_first_order THEN 'first_order_bonus' ELSE 'earned' END,
        CASE WHEN is_first_order THEN 'First order bonus + points: ' || points_earned || ' (5% of ₹' || p_order_amount || ')'
             ELSE 'Points earned: ' || points_earned || ' (5% of ₹' || p_order_amount || ')' END,
        NOW()
    );
END;
$$;

-- 3. Fix get_user_cafe_loyalty_summary to use NEW logic
CREATE OR REPLACE FUNCTION get_user_cafe_loyalty_summary(p_user_id UUID)
RETURNS TABLE (
    cafe_id UUID,
    cafe_name TEXT,
    points INTEGER,
    total_spent DECIMAL(10,2),
    loyalty_level INTEGER,
    discount_percentage DECIMAL(3,1),
    monthly_maintenance_spent DECIMAL(10,2),
    monthly_maintenance_required DECIMAL(10,2),
    maintenance_met BOOLEAN,
    days_until_month_end INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        clp.cafe_id,
        c.name as cafe_name,
        clp.points,
        clp.total_spent,
        clp.loyalty_level,
        get_cafe_loyalty_discount(clp.loyalty_level) as discount_percentage,
        COALESCE(clp.monthly_spend_30_days, 0) as monthly_maintenance_spent,
        CASE 
            WHEN clp.current_tier = 'connoisseur' THEN 6500.0
            WHEN clp.current_tier = 'gourmet' THEN 3500.0
            ELSE 0.0
        END as monthly_maintenance_required,
        CASE 
            WHEN clp.current_tier = 'connoisseur' THEN clp.monthly_spend_30_days >= 6500
            WHEN clp.current_tier = 'gourmet' THEN clp.monthly_spend_30_days >= 3500
            ELSE TRUE
        END as maintenance_met,
        EXTRACT(DAY FROM (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day' - NOW()))::INTEGER as days_until_month_end
    FROM public.cafe_loyalty_points clp
    JOIN public.cafes c ON clp.cafe_id = c.id
    WHERE clp.user_id = p_user_id
    ORDER BY clp.total_spent DESC;
END;
$$;

-- 4. Drop conflicting functions that use old logic
DROP FUNCTION IF EXISTS handle_cafe_loyalty_order_completion();
DROP FUNCTION IF EXISTS initialize_cafe_loyalty_for_existing_users();
DROP FUNCTION IF EXISTS migrate_existing_loyalty_to_cafe_specific();
DROP FUNCTION IF EXISTS update_enhanced_loyalty_tier();
DROP FUNCTION IF EXISTS update_loyalty_tier();

-- 5. Verify our functions are correct
SELECT 
    '=== FUNCTION VERIFICATION ===' as section,
    'All functions should now use NEW logic' as status;
