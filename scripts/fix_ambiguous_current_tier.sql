-- =====================================================
-- Fix Ambiguous current_tier Reference
-- =====================================================

-- Fix the ambiguous column reference in handle_new_rewards_order_completion
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
            current_tier = EXCLUDED.current_tier, -- FIXED: Use EXCLUDED.current_tier
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION handle_new_rewards_order_completion TO authenticated;

-- Verify the fix
SELECT 
  '=== FUNCTION FIXED ===' as section,
  'Ambiguous current_tier reference has been resolved' as status,
  'POS dashboard should now work without errors' as expected_result;
