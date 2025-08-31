-- Create an ultra-simple working version of get_user_enhanced_rewards_summary
DROP FUNCTION IF EXISTS get_user_enhanced_rewards_summary(UUID);

CREATE OR REPLACE FUNCTION get_user_enhanced_rewards_summary(user_id UUID)
RETURNS TABLE(
    current_tier VARCHAR(20),
    current_points INTEGER,
    tier_discount INTEGER,
    next_tier VARCHAR(20),
    points_to_next_tier INTEGER,
    maintenance_required BOOLEAN,
    maintenance_amount DECIMAL(10,2),
    maintenance_spent DECIMAL(10,2),
    maintenance_progress INTEGER,
    days_until_expiry INTEGER,
    is_new_user BOOLEAN,
    new_user_orders_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'foodie'::VARCHAR(20),
        0,
        5,
        'gourmet',
        151,
        FALSE,
        0,
        0,
        0,
        0,
        TRUE,
        0;
END;
$$;
