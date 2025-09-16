-- Fix all function_search_path_mutable warnings
-- This will resolve the security warnings and ensure functions work properly

-- 1. Fix get_cafes_ordered function
CREATE OR REPLACE FUNCTION get_cafes_ordered()
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    image_url TEXT,
    rating NUMERIC,
    total_reviews INTEGER,
    type TEXT,
    location TEXT,
    slug TEXT,
    priority INTEGER,
    accepting_orders BOOLEAN,
    phone TEXT,
    hours TEXT,
    average_rating DECIMAL(3,2),
    total_ratings INTEGER,
    cuisine_categories TEXT[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.description,
        c.image_url,
        c.rating,
        c.total_reviews,
        c.type,
        c.location,
        c.slug,
        c.priority,
        c.accepting_orders,
        c.phone,
        c.hours,
        c.average_rating,
        c.total_ratings,
        c.cuisine_categories
    FROM public.cafes c
    WHERE c.accepting_orders = true
    ORDER BY c.priority DESC, c.average_rating DESC, c.total_ratings DESC;
END;
$$;

-- 2. Fix get_system_performance_metrics function
CREATE OR REPLACE FUNCTION get_system_performance_metrics()
RETURNS TABLE (
    total_orders_today BIGINT,
    active_cafes BIGINT,
    avg_order_value NUMERIC,
    peak_hour INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if the 'orders' table exists and has 'created_at' and 'total_amount' columns
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'orders'
    ) OR NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'created_at'
    ) OR NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'total_amount'
    ) THEN
        -- If table or columns don't exist, return default zero values
        RETURN QUERY SELECT 0::BIGINT, 0::BIGINT, 0::NUMERIC, 0::INTEGER;
        RETURN;
    END IF;

    -- If table and columns exist, execute the actual query
    RETURN QUERY
    SELECT 
        COALESCE(COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE), 0) as total_orders_today,
        COALESCE(COUNT(DISTINCT cafe_id) FILTER (WHERE created_at >= CURRENT_DATE), 0) as active_cafes,
        COALESCE(AVG(total_amount) FILTER (WHERE created_at >= CURRENT_DATE), 0) as avg_order_value,
        COALESCE(
            (SELECT EXTRACT(HOUR FROM created_at)::INTEGER
             FROM public.orders
             WHERE created_at >= CURRENT_DATE
             GROUP BY EXTRACT(HOUR FROM created_at)
             ORDER BY COUNT(*) DESC
             LIMIT 1), 0
        ) as peak_hour;
END;
$$;

-- 3. Fix calculate_cafe_tier function
CREATE OR REPLACE FUNCTION calculate_cafe_tier(cafe_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_orders INTEGER;
    total_revenue NUMERIC;
BEGIN
    SELECT 
        COALESCE(COUNT(*), 0),
        COALESCE(SUM(total_amount), 0)
    INTO total_orders, total_revenue
    FROM public.orders
    WHERE cafe_id = $1
    AND created_at >= CURRENT_DATE - INTERVAL '30 days';
    
    IF total_orders >= 100 AND total_revenue >= 50000 THEN
        RETURN 'GOLD';
    ELSIF total_orders >= 50 AND total_revenue >= 25000 THEN
        RETURN 'SILVER';
    ELSIF total_orders >= 20 AND total_revenue >= 10000 THEN
        RETURN 'BRONZE';
    ELSE
        RETURN 'BASIC';
    END IF;
END;
$$;

-- 4. Fix get_tier_discount function
CREATE OR REPLACE FUNCTION get_tier_discount(tier TEXT)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    CASE tier
        WHEN 'GOLD' THEN RETURN 0.15;
        WHEN 'SILVER' THEN RETURN 0.10;
        WHEN 'BRONZE' THEN RETURN 0.05;
        ELSE RETURN 0.00;
    END CASE;
END;
$$;

-- 5. Fix calculate_points_earned function
CREATE OR REPLACE FUNCTION calculate_points_earned(order_amount NUMERIC, user_tier TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    base_points INTEGER;
    multiplier NUMERIC;
BEGIN
    base_points := FLOOR(order_amount / 100) * 10; -- 10 points per 100 rupees
    
    CASE user_tier
        WHEN 'GOLD' THEN multiplier := 1.5;
        WHEN 'SILVER' THEN multiplier := 1.25;
        WHEN 'BRONZE' THEN multiplier := 1.1;
        ELSE multiplier := 1.0;
    END CASE;
    
    RETURN FLOOR(base_points * multiplier);
END;
$$;

-- 6. Fix get_user_cafe_loyalty_summary function
CREATE OR REPLACE FUNCTION get_user_cafe_loyalty_summary(user_id UUID, cafe_id UUID)
RETURNS TABLE (
    total_orders INTEGER,
    total_spent NUMERIC,
    loyalty_points INTEGER,
    tier TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(COUNT(*), 0)::INTEGER as total_orders,
        COALESCE(SUM(total_amount), 0) as total_spent,
        COALESCE(SUM(points_earned), 0)::INTEGER as loyalty_points,
        COALESCE(MAX(loyalty_tier), 'BASIC') as tier
    FROM public.orders
    WHERE user_id = $1 AND cafe_id = $2
    AND created_at >= CURRENT_DATE - INTERVAL '90 days';
END;
$$;

-- 7. Fix calculate_cafe_loyalty_level function
CREATE OR REPLACE FUNCTION calculate_cafe_loyalty_level(user_id UUID, cafe_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_orders INTEGER;
    total_spent NUMERIC;
BEGIN
    SELECT 
        COALESCE(COUNT(*), 0),
        COALESCE(SUM(total_amount), 0)
    INTO total_orders, total_spent
    FROM public.orders
    WHERE user_id = $1 AND cafe_id = $2
    AND created_at >= CURRENT_DATE - INTERVAL '90 days';
    
    IF total_orders >= 20 AND total_spent >= 5000 THEN
        RETURN 'GOLD';
    ELSIF total_orders >= 10 AND total_spent >= 2500 THEN
        RETURN 'SILVER';
    ELSIF total_orders >= 5 AND total_spent >= 1000 THEN
        RETURN 'BRONZE';
    ELSE
        RETURN 'BASIC';
    END IF;
END;
$$;

-- 8. Fix get_cafe_loyalty_discount function
CREATE OR REPLACE FUNCTION get_cafe_loyalty_discount(user_id UUID, cafe_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    tier TEXT;
BEGIN
    SELECT calculate_cafe_loyalty_level(user_id, cafe_id) INTO tier;
    RETURN get_tier_discount(tier);
END;
$$;

-- 9. Fix update_cafe_loyalty_points function
CREATE OR REPLACE FUNCTION update_cafe_loyalty_points(user_id UUID, cafe_id UUID, points INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.profiles
    SET loyalty_points = loyalty_points + points
    WHERE id = user_id;
    
    INSERT INTO public.loyalty_transactions (
        user_id, cafe_id, points_change, transaction_type, description
    ) VALUES (
        user_id, cafe_id, points, 'earned', 'Points earned from order'
    );
END;
$$;

-- 10. Fix validate_order_placement function
CREATE OR REPLACE FUNCTION validate_order_placement(user_id UUID, cafe_id UUID, order_amount NUMERIC)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    cafe_exists BOOLEAN;
    user_exists BOOLEAN;
    cafe_accepting BOOLEAN;
BEGIN
    -- Check if cafe exists and is accepting orders
    SELECT EXISTS(SELECT 1 FROM public.cafes WHERE id = cafe_id AND accepting_orders = true) INTO cafe_exists;
    
    -- Check if user exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id) INTO user_exists;
    
    -- Check if cafe is accepting orders
    SELECT accepting_orders INTO cafe_accepting FROM public.cafes WHERE id = cafe_id;
    
    RETURN cafe_exists AND user_exists AND cafe_accepting AND order_amount > 0;
END;
$$;

-- 11. Fix get_cafe_dashboard_optimized function
CREATE OR REPLACE FUNCTION get_cafe_dashboard_optimized(cafe_id UUID)
RETURNS TABLE (
    total_orders_today INTEGER,
    total_revenue_today NUMERIC,
    pending_orders INTEGER,
    completed_orders INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_orders_today,
        COALESCE(SUM(total_amount), 0) as total_revenue_today,
        COUNT(*) FILTER (WHERE status IN ('received', 'confirmed', 'preparing'))::INTEGER as pending_orders,
        COUNT(*) FILTER (WHERE status = 'completed')::INTEGER as completed_orders
    FROM public.orders
    WHERE cafe_id = $1
    AND created_at >= CURRENT_DATE;
END;
$$;

-- 12. Fix get_order_queue_optimized function
CREATE OR REPLACE FUNCTION get_order_queue_optimized(cafe_id UUID)
RETURNS TABLE (
    order_id UUID,
    order_number TEXT,
    customer_name TEXT,
    total_amount NUMERIC,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.order_number,
        p.full_name,
        o.total_amount,
        o.status,
        o.created_at
    FROM public.orders o
    JOIN public.profiles p ON o.user_id = p.id
    WHERE o.cafe_id = $1
    AND o.status IN ('received', 'confirmed', 'preparing')
    ORDER BY o.created_at ASC;
END;
$$;

-- 13. Fix cleanup_old_data function
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Clean up old audit logs (older than 90 days)
    DELETE FROM public.audit_logs 
    WHERE created_at < CURRENT_DATE - INTERVAL '90 days';
    
    -- Clean up old notifications (older than 30 days)
    DELETE FROM public.order_notifications 
    WHERE created_at < CURRENT_DATE - INTERVAL '30 days';
    
    -- Clean up old analytics data (older than 1 year)
    DELETE FROM public.order_analytics 
    WHERE created_at < CURRENT_DATE - INTERVAL '1 year';
END;
$$;

-- 14. Fix update_promotional_banners_updated_at function
CREATE OR REPLACE FUNCTION update_promotional_banners_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 15. Fix log_security_event function
CREATE OR REPLACE FUNCTION log_security_event(
    event_type TEXT,
    user_id UUID DEFAULT NULL,
    details JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.audit_logs (
        event_type,
        user_id,
        details,
        ip_address,
        user_agent
    ) VALUES (
        event_type,
        user_id,
        details,
        inet_client_addr(),
        current_setting('request.headers', true)::jsonb->>'user-agent'
    );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_cafes_ordered() TO authenticated;
GRANT EXECUTE ON FUNCTION get_cafes_ordered() TO anon;
GRANT EXECUTE ON FUNCTION get_system_performance_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_system_performance_metrics() TO anon;
GRANT EXECUTE ON FUNCTION calculate_cafe_tier(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_tier_discount(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_points_earned(NUMERIC, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_cafe_loyalty_summary(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_cafe_loyalty_level(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_cafe_loyalty_discount(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_cafe_loyalty_points(UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_order_placement(UUID, UUID, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION get_cafe_dashboard_optimized(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_order_queue_optimized(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_data() TO authenticated;
GRANT EXECUTE ON FUNCTION log_security_event(TEXT, UUID, JSONB) TO authenticated;

-- Test the main function
SELECT 'All functions updated with search_path security fixes' as status;
