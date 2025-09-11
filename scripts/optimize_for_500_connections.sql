-- High-Performance Database Optimization for 500+ Concurrent Connections
-- This script optimizes your Supabase database for high-scale traffic

-- 1. CONNECTION POOL OPTIMIZATION
-- Increase connection limits and optimize for high concurrency
ALTER SYSTEM SET max_connections = 500;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '16MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- 2. PERFORMANCE INDEXES FOR HIGH CONCURRENCY
-- Orders table optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_high_concurrency 
ON public.orders(cafe_id, status, created_at DESC) 
WHERE status IN ('pending', 'confirmed', 'preparing');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_activity 
ON public.orders(user_id, created_at DESC) 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_cafe_status_time 
ON public.orders(cafe_id, status, created_at) 
INCLUDE (total_amount, order_number);

-- Order items optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_high_perf 
ON public.order_items(order_id, menu_item_id) 
INCLUDE (quantity, price);

-- Menu items optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menu_items_cafe_available 
ON public.menu_items(cafe_id, is_available, category) 
WHERE is_available = true;

-- Users and profiles optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_active_users 
ON public.profiles(id, created_at) 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

-- 3. PARTITIONING FOR HIGH VOLUME DATA
-- Partition orders table by month for better performance
CREATE TABLE IF NOT EXISTS public.orders_2024_01 PARTITION OF public.orders
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE IF NOT EXISTS public.orders_2024_02 PARTITION OF public.orders
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Add more partitions as needed...

-- 4. MATERIALIZED VIEWS FOR ANALYTICS
CREATE MATERIALIZED VIEW IF NOT EXISTS public.daily_order_stats AS
SELECT 
    DATE(created_at) as order_date,
    cafe_id,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_order_value,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders
FROM public.orders
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), cafe_id;

CREATE UNIQUE INDEX ON public.daily_order_stats (order_date, cafe_id);
REFRESH MATERIALIZED VIEW CONCURRENTLY public.daily_order_stats;

-- 5. CONNECTION MONITORING FUNCTIONS
CREATE OR REPLACE FUNCTION get_connection_metrics()
RETURNS TABLE (
    total_connections INTEGER,
    active_connections INTEGER,
    idle_connections INTEGER,
    max_connections INTEGER,
    connection_utilization NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT setting::INTEGER FROM pg_settings WHERE name = 'max_connections') as total_connections,
        (SELECT count(*)::INTEGER FROM pg_stat_activity WHERE state = 'active') as active_connections,
        (SELECT count(*)::INTEGER FROM pg_stat_activity WHERE state = 'idle') as idle_connections,
        (SELECT setting::INTEGER FROM pg_settings WHERE name = 'max_connections') as max_connections,
        ROUND(
            (SELECT count(*)::NUMERIC FROM pg_stat_activity WHERE state = 'active') / 
            (SELECT setting::NUMERIC FROM pg_settings WHERE name = 'max_connections') * 100, 2
        ) as connection_utilization;
END;
$$ LANGUAGE plpgsql;

-- 6. PERFORMANCE MONITORING FUNCTION
CREATE OR REPLACE FUNCTION get_performance_metrics()
RETURNS TABLE (
    total_orders_today BIGINT,
    active_cafes BIGINT,
    avg_order_value NUMERIC,
    peak_hour INTEGER,
    connection_utilization NUMERIC,
    avg_response_time_ms NUMERIC,
    error_rate NUMERIC
) AS $$
BEGIN
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
        ) as peak_hour,
        (SELECT connection_utilization FROM get_connection_metrics()) as connection_utilization,
        COALESCE(
            (SELECT AVG(EXTRACT(EPOCH FROM (query_start - now())) * 1000)
             FROM pg_stat_activity 
             WHERE state = 'active' AND query_start > now() - INTERVAL '1 minute'), 0
        ) as avg_response_time_ms,
        COALESCE(
            (SELECT COUNT(*)::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE status != 'cancelled'), 0) * 100
             FROM public.orders 
             WHERE created_at >= CURRENT_DATE), 0
        ) as error_rate;
END;
$$ LANGUAGE plpgsql;

-- 7. QUERY OPTIMIZATION SETTINGS
-- Enable query plan caching
ALTER SYSTEM SET plan_cache_mode = 'force_custom_plan';
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET seq_page_cost = 1.0;

-- 8. CONNECTION POOL CONFIGURATION
-- Optimize for high concurrency
ALTER SYSTEM SET tcp_keepalives_idle = 600;
ALTER SYSTEM SET tcp_keepalives_interval = 30;
ALTER SYSTEM SET tcp_keepalives_count = 3;

-- 9. CACHING OPTIMIZATION
-- Enable query result caching
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 10. MONITORING AND ALERTING
CREATE OR REPLACE FUNCTION check_system_health()
RETURNS TABLE (
    health_status TEXT,
    connection_usage NUMERIC,
    memory_usage NUMERIC,
    disk_usage NUMERIC,
    recommendations TEXT[]
) AS $$
DECLARE
    conn_usage NUMERIC;
    mem_usage NUMERIC;
    disk_usage NUMERIC;
    recommendations TEXT[] := '{}';
BEGIN
    -- Get connection usage
    SELECT connection_utilization INTO conn_usage FROM get_connection_metrics();
    
    -- Get memory usage (simplified)
    SELECT ROUND(
        (SELECT setting::NUMERIC FROM pg_settings WHERE name = 'shared_buffers') / 
        (SELECT setting::NUMERIC FROM pg_settings WHERE name = 'effective_cache_size') * 100, 2
    ) INTO mem_usage;
    
    -- Determine health status
    IF conn_usage > 90 OR mem_usage > 90 THEN
        health_status := 'critical';
        recommendations := array_append(recommendations, 'Scale up database resources');
        recommendations := array_append(recommendations, 'Consider connection pooling');
    ELSIF conn_usage > 70 OR mem_usage > 70 THEN
        health_status := 'warning';
        recommendations := array_append(recommendations, 'Monitor connection usage closely');
    ELSE
        health_status := 'healthy';
    END IF;
    
    RETURN QUERY SELECT health_status, conn_usage, mem_usage, disk_usage, recommendations;
END;
$$ LANGUAGE plpgsql;

-- 11. GRANT PERMISSIONS
GRANT EXECUTE ON FUNCTION get_connection_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_performance_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION check_system_health() TO authenticated;

-- 12. CREATE MONITORING VIEW
CREATE OR REPLACE VIEW public.system_health_view AS
SELECT 
    NOW() as timestamp,
    h.health_status,
    h.connection_usage,
    h.memory_usage,
    h.disk_usage,
    h.recommendations,
    c.total_connections,
    c.active_connections,
    c.idle_connections
FROM check_system_health() h
CROSS JOIN get_connection_metrics() c;

-- 13. AUTOMATED CLEANUP
-- Clean up old logs and temporary data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS VOID AS $$
BEGIN
    -- Delete old order notifications (older than 30 days)
    DELETE FROM public.order_notifications 
    WHERE created_at < CURRENT_DATE - INTERVAL '30 days';
    
    -- Delete old analytics data (older than 90 days)
    DELETE FROM public.order_analytics 
    WHERE created_at < CURRENT_DATE - INTERVAL '90 days';
    
    -- Vacuum and analyze tables
    VACUUM ANALYZE public.orders;
    VACUUM ANALYZE public.order_items;
    VACUUM ANALYZE public.menu_items;
END;
$$ LANGUAGE plpgsql;

-- 14. SCHEDULE CLEANUP (if using pg_cron extension)
-- SELECT cron.schedule('cleanup-old-data', '0 2 * * *', 'SELECT cleanup_old_data();');

-- 15. FINAL OPTIMIZATION
-- Update table statistics
ANALYZE public.orders;
ANALYZE public.order_items;
ANALYZE public.menu_items;
ANALYZE public.cafes;
ANALYZE public.profiles;

-- Refresh materialized views
REFRESH MATERIALIZED VIEW CONCURRENTLY public.daily_order_stats;

-- 16. PERFORMANCE TESTING QUERIES
-- Test queries to verify optimization
EXPLAIN (ANALYZE, BUFFERS) 
SELECT COUNT(*) FROM public.orders 
WHERE created_at >= CURRENT_DATE 
AND status = 'pending';

EXPLAIN (ANALYZE, BUFFERS)
SELECT c.name, COUNT(o.id) as order_count
FROM public.cafes c
LEFT JOIN public.orders o ON c.id = o.cafe_id
WHERE o.created_at >= CURRENT_DATE
GROUP BY c.id, c.name
ORDER BY order_count DESC;
