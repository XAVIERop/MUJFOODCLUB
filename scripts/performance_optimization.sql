-- Performance Optimization Script
-- This script adds critical database indexes for better query performance

-- 1. Orders table optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_cafe_status_created 
ON public.orders(cafe_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_created 
ON public.orders(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_created 
ON public.orders(status, created_at DESC);

-- 2. Menu items optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menu_items_cafe_category 
ON public.menu_items(cafe_id, category);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menu_items_cafe_available 
ON public.menu_items(cafe_id, is_available) WHERE is_available = true;

-- 3. Order items optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_order_id 
ON public.order_items(order_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_menu_item 
ON public.order_items(menu_item_id);

-- 4. Profiles optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email 
ON public.profiles(email);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_loyalty_points 
ON public.profiles(loyalty_points DESC);

-- 5. Cafe staff optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cafe_staff_user_active 
ON public.cafe_staff(user_id, is_active) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cafe_staff_cafe_active 
ON public.cafe_staff(cafe_id, is_active) WHERE is_active = true;

-- 6. Loyalty transactions optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loyalty_transactions_user_created 
ON public.loyalty_transactions(user_id, created_at DESC);

-- 7. Analytics and performance tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_analytics 
ON public.orders(cafe_id, created_at, status, total_amount);

-- 8. Update table statistics for better query planning
ANALYZE public.orders;
ANALYZE public.menu_items;
ANALYZE public.order_items;
ANALYZE public.profiles;
ANALYZE public.cafe_staff;
ANALYZE public.loyalty_transactions;

-- 9. Create a materialized view for frequently accessed cafe statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS cafe_stats AS
SELECT 
    c.id as cafe_id,
    c.name as cafe_name,
    COUNT(o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_revenue,
    COALESCE(AVG(o.total_amount), 0) as avg_order_value,
    COUNT(CASE WHEN o.created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as orders_today,
    COUNT(CASE WHEN o.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as orders_this_week
FROM public.cafes c
LEFT JOIN public.orders o ON c.id = o.cafe_id
GROUP BY c.id, c.name;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_cafe_stats_cafe_id ON cafe_stats(cafe_id);

-- 10. Create a function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_cafe_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY cafe_stats;
END;
$$ LANGUAGE plpgsql;

-- 11. Set up automatic refresh (this would need to be scheduled via cron or similar)
-- For now, we'll create a trigger to refresh on order changes
CREATE OR REPLACE FUNCTION trigger_refresh_cafe_stats()
RETURNS trigger AS $$
BEGIN
    -- Refresh stats asynchronously to avoid blocking
    PERFORM pg_notify('refresh_cafe_stats', '');
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order changes
DROP TRIGGER IF EXISTS orders_cafe_stats_trigger ON public.orders;
CREATE TRIGGER orders_cafe_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_refresh_cafe_stats();

-- 12. Add query performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 13. Optimize connection settings (these would typically be set in postgresql.conf)
-- For Supabase, these are managed by the platform, but we can set session-level optimizations
SET work_mem = '256MB';
SET shared_buffers = '256MB';
SET effective_cache_size = '1GB';

-- 14. Create a function to get optimized order data
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

-- 15. Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_optimized_orders(UUID, INTEGER) TO authenticated;
GRANT SELECT ON cafe_stats TO authenticated;

-- 16. Create a function to get cafe performance metrics
CREATE OR REPLACE FUNCTION get_cafe_performance_metrics(p_cafe_id UUID)
RETURNS TABLE (
    total_orders BIGINT,
    total_revenue DECIMAL,
    avg_order_value DECIMAL,
    orders_today BIGINT,
    orders_this_week BIGINT,
    top_items JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cs.total_orders,
        cs.total_revenue,
        cs.avg_order_value,
        cs.orders_today,
        cs.orders_this_week,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'name', mi.name,
                        'orders', item_count,
                        'revenue', item_revenue
                    )
                )
                FROM (
                    SELECT 
                        mi.name,
                        COUNT(*) as item_count,
                        SUM(oi.total_price) as item_revenue
                    FROM public.order_items oi
                    JOIN public.menu_items mi ON oi.menu_item_id = mi.id
                    JOIN public.orders o ON oi.order_id = o.id
                    WHERE o.cafe_id = p_cafe_id
                    GROUP BY mi.name
                    ORDER BY item_count DESC
                    LIMIT 5
                ) top_items
            ),
            '[]'::jsonb
        ) as top_items
    FROM cafe_stats cs
    WHERE cs.cafe_id = p_cafe_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_cafe_performance_metrics(UUID) TO authenticated;

-- 17. Add performance monitoring queries
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

-- 18. Create a function to clean up old data (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Delete orders older than 1 year
    DELETE FROM public.orders 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    -- Delete old loyalty transactions
    DELETE FROM public.loyalty_transactions 
    WHERE created_at < NOW() - INTERVAL '2 years';
    
    -- Refresh materialized view
    PERFORM refresh_cafe_stats();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 19. Add comments for documentation
COMMENT ON FUNCTION get_optimized_orders(UUID, INTEGER) IS 'Optimized function to fetch orders with related data in a single query';
COMMENT ON FUNCTION get_cafe_performance_metrics(UUID) IS 'Get comprehensive performance metrics for a cafe';
COMMENT ON FUNCTION cleanup_old_data() IS 'Maintenance function to clean up old data and refresh statistics';
COMMENT ON MATERIALIZED VIEW cafe_stats IS 'Materialized view for fast cafe statistics access';

-- 20. Final optimization: Update table statistics
ANALYZE;
