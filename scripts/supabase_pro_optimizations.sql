-- Supabase Pro Optimizations for MUJ Food Club
-- Run these in your Supabase SQL Editor

-- 1. CRITICAL PERFORMANCE INDEXES
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_cafe_status_created 
ON public.orders(cafe_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_created 
ON public.orders(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menu_items_cafe_category 
ON public.menu_items(cafe_id, category);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_order_id 
ON public.order_items(order_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email 
ON public.profiles(email);

-- 2. MATERIALIZED VIEW FOR CAFE ANALYTICS
CREATE MATERIALIZED VIEW IF NOT EXISTS cafe_performance AS
SELECT 
    c.id as cafe_id,
    c.name as cafe_name,
    COUNT(o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_revenue,
    COALESCE(AVG(o.total_amount), 0) as avg_order_value,
    COUNT(CASE WHEN o.created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as orders_today,
    COUNT(CASE WHEN o.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as orders_this_week,
    COUNT(CASE WHEN o.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as orders_this_month
FROM public.cafes c
LEFT JOIN public.orders o ON c.id = o.cafe_id
GROUP BY c.id, c.name;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_cafe_performance_cafe_id ON cafe_performance(cafe_id);

-- 3. OPTIMIZED ORDER FETCHING FUNCTION
CREATE OR REPLACE FUNCTION get_optimized_orders(p_cafe_id UUID, p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
    id UUID,
    order_number TEXT,
    status TEXT,
    total_amount DECIMAL,
    created_at TIMESTAMPTZ,
    customer_name TEXT,
    customer_phone TEXT,
    customer_block TEXT,
    items JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.order_number,
        o.status,
        o.total_amount,
        o.created_at,
        p.full_name as customer_name,
        p.phone as customer_phone,
        p.block as customer_block,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', oi.id,
                    'name', mi.name,
                    'quantity', oi.quantity,
                    'price', oi.unit_price,
                    'total', oi.total_price
                )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'::jsonb
        ) as items
    FROM public.orders o
    JOIN public.profiles p ON o.user_id = p.id
    LEFT JOIN public.order_items oi ON o.id = oi.order_id
    LEFT JOIN public.menu_items mi ON oi.menu_item_id = mi.id
    WHERE o.cafe_id = p_cafe_id
    GROUP BY o.id, o.order_number, o.status, o.total_amount, o.created_at, p.full_name, p.phone, p.block
    ORDER BY o.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CAFE ANALYTICS FUNCTION
CREATE OR REPLACE FUNCTION get_cafe_analytics(p_cafe_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    total_orders BIGINT,
    total_revenue DECIMAL,
    avg_order_value DECIMAL,
    orders_today BIGINT,
    orders_this_week BIGINT,
    top_items JSONB,
    peak_hours JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_revenue,
        COALESCE(AVG(o.total_amount), 0) as avg_order_value,
        COUNT(CASE WHEN o.created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as orders_today,
        COUNT(CASE WHEN o.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as orders_this_week,
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'name', mi.name,
                    'orders', COUNT(*),
                    'revenue', SUM(oi.total_price)
                )
            )
            FROM order_items oi
            JOIN menu_items mi ON oi.menu_item_id = mi.id
            JOIN orders o2 ON oi.order_id = o2.id
            WHERE o2.cafe_id = p_cafe_id
            AND o2.created_at >= NOW() - (p_days || ' days')::INTERVAL
            GROUP BY mi.name
            ORDER BY COUNT(*) DESC
            LIMIT 5
        ) as top_items,
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'hour', hour,
                    'orders', order_count
                )
            )
            FROM (
                SELECT 
                    EXTRACT(HOUR FROM created_at)::INTEGER as hour,
                    COUNT(*) as order_count
                FROM orders
                WHERE cafe_id = p_cafe_id
                AND created_at >= NOW() - (p_days || ' days')::INTERVAL
                GROUP BY EXTRACT(HOUR FROM created_at)
                ORDER BY order_count DESC
                LIMIT 5
            ) peak_data
        ) as peak_hours
    FROM orders o
    WHERE o.cafe_id = p_cafe_id
    AND o.created_at >= NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. REFRESH MATERIALIZED VIEW FUNCTION
CREATE OR REPLACE FUNCTION refresh_cafe_performance()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY cafe_performance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. GRANT PERMISSIONS
GRANT EXECUTE ON FUNCTION get_optimized_orders(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_cafe_analytics(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_cafe_performance() TO authenticated;
GRANT SELECT ON cafe_performance TO authenticated;

-- 7. UPDATE TABLE STATISTICS
ANALYZE public.orders;
ANALYZE public.menu_items;
ANALYZE public.order_items;
ANALYZE public.profiles;
ANALYZE public.cafes;

-- 8. CREATE TRIGGER FOR AUTOMATIC REFRESH
CREATE OR REPLACE FUNCTION trigger_refresh_cafe_performance()
RETURNS trigger AS $$
BEGIN
    -- Refresh stats asynchronously
    PERFORM pg_notify('refresh_cafe_performance', '');
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order changes
DROP TRIGGER IF EXISTS orders_cafe_performance_trigger ON public.orders;
CREATE TRIGGER orders_cafe_performance_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_refresh_cafe_performance();

-- 9. PERFORMANCE MONITORING QUERIES
CREATE OR REPLACE FUNCTION get_slow_queries()
RETURNS TABLE (
    query TEXT,
    calls BIGINT,
    total_time DOUBLE PRECISION,
    mean_time DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        query,
        calls,
        total_time,
        mean_time
    FROM pg_stat_statements
    WHERE mean_time > 100 -- queries taking more than 100ms on average
    ORDER BY mean_time DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. DATA CLEANUP FUNCTION
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Archive orders older than 1 year (optional)
    -- DELETE FROM public.orders WHERE created_at < NOW() - INTERVAL '1 year';
    
    -- Clean up old loyalty transactions (older than 2 years)
    DELETE FROM public.loyalty_transactions 
    WHERE created_at < NOW() - INTERVAL '2 years';
    
    -- Refresh materialized view
    PERFORM refresh_cafe_performance();
    
    -- Update statistics
    ANALYZE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. FINAL OPTIMIZATION
ANALYZE;
