-- Production Database Optimization for 12K+ Students & 30+ Cafes
-- This script optimizes the database for high-scale production use

-- ==============================================
-- 1. INDEX OPTIMIZATION
-- ==============================================

-- Profiles table indexes for fast user lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email_hash ON public.profiles USING hash(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_student_id_hash ON public.profiles USING hash(student_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_qr_code_hash ON public.profiles USING hash(qr_code);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_block_btree ON public.profiles(block);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_user_type_btree ON public.profiles(user_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_created_at_btree ON public.profiles(created_at);

-- Cafes table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cafes_name_gin ON public.cafes USING gin(to_tsvector('english', name));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cafes_type_btree ON public.cafes(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cafes_is_active_btree ON public.cafes(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cafes_rating_btree ON public.cafes(rating DESC);

-- Menu items indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menu_items_cafe_id_btree ON public.menu_items(cafe_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menu_items_category_btree ON public.menu_items(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menu_items_is_available_btree ON public.menu_items(is_available);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menu_items_name_gin ON public.menu_items USING gin(to_tsvector('english', name));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menu_items_price_btree ON public.menu_items(price);

-- Orders table indexes (most critical for performance)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_id_btree ON public.orders(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_cafe_id_btree ON public.orders(cafe_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_btree ON public.orders(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at_btree ON public.orders(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_order_number_hash ON public.orders USING hash(order_number);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_delivery_block_btree ON public.orders(delivery_block);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_completed_at_btree ON public.orders(completed_at DESC) WHERE status = 'completed';

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_cafe_status_created ON public.orders(cafe_id, status, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_status_created ON public.orders(user_id, status, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_cafe_completed_at ON public.orders(cafe_id, completed_at DESC) WHERE status = 'completed';

-- Order items indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_order_id_btree ON public.order_items(order_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_menu_item_id_btree ON public.order_items(menu_item_id);

-- Loyalty transactions indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loyalty_transactions_user_id_btree ON public.loyalty_transactions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loyalty_transactions_order_id_btree ON public.loyalty_transactions(order_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loyalty_transactions_created_at_btree ON public.loyalty_transactions(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loyalty_transactions_type_btree ON public.loyalty_transactions(transaction_type);

-- Order notifications indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_notifications_cafe_id_btree ON public.order_notifications(cafe_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_notifications_user_id_btree ON public.order_notifications(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_notifications_is_read_btree ON public.order_notifications(is_read);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_notifications_created_at_btree ON public.order_notifications(created_at DESC);

-- Cafe staff indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cafe_staff_cafe_id_btree ON public.cafe_staff(cafe_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cafe_staff_user_id_btree ON public.cafe_staff(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cafe_staff_is_active_btree ON public.cafe_staff(is_active);

-- ==============================================
-- 2. PARTITIONING FOR ORDERS TABLE
-- ==============================================

-- Create partitioned orders table for better performance with large datasets
-- This will help with query performance as the orders table grows

-- Create monthly partitions for orders (optional - uncomment if needed)
-- CREATE TABLE public.orders_y2024m01 PARTITION OF public.orders
-- FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- ==============================================
-- 3. MATERIALIZED VIEWS FOR ANALYTICS
-- ==============================================

-- Daily order summary for cafes
CREATE MATERIALIZED VIEW IF NOT EXISTS public.daily_cafe_orders AS
SELECT 
    cafe_id,
    DATE(created_at) as order_date,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_order_value,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
FROM public.orders
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY cafe_id, DATE(created_at);

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_cafe_orders_cafe_date ON public.daily_cafe_orders(cafe_id, order_date);

-- User activity summary
CREATE MATERIALIZED VIEW IF NOT EXISTS public.user_activity_summary AS
SELECT 
    user_id,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_spent,
    MAX(created_at) as last_order_date,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as orders_last_30_days,
    SUM(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN total_amount ELSE 0 END) as spent_last_30_days
FROM public.orders
WHERE status = 'completed'
GROUP BY user_id;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_activity_summary_user_id ON public.user_activity_summary(user_id);

-- ==============================================
-- 4. DATABASE CONFIGURATION OPTIMIZATION
-- ==============================================

-- Update database settings for better performance
-- Note: These may need to be set at the Supabase project level

-- Increase work_mem for complex queries
-- ALTER SYSTEM SET work_mem = '256MB';

-- Increase shared_buffers for better caching
-- ALTER SYSTEM SET shared_buffers = '256MB';

-- Optimize random_page_cost for SSD storage
-- ALTER SYSTEM SET random_page_cost = 1.1;

-- ==============================================
-- 5. CLEANUP AND MAINTENANCE FUNCTIONS
-- ==============================================

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION public.refresh_analytics_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.daily_cafe_orders;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_activity_summary;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old notifications (keep only last 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM public.order_notifications 
    WHERE created_at < CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Function to archive old completed orders (optional)
CREATE OR REPLACE FUNCTION public.archive_old_orders()
RETURNS void AS $$
BEGIN
    -- Create archive table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.orders_archive (LIKE public.orders INCLUDING ALL);
    
    -- Move orders older than 1 year to archive
    INSERT INTO public.orders_archive 
    SELECT * FROM public.orders 
    WHERE status = 'completed' 
    AND completed_at < CURRENT_DATE - INTERVAL '1 year';
    
    -- Delete archived orders from main table
    DELETE FROM public.orders 
    WHERE status = 'completed' 
    AND completed_at < CURRENT_DATE - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 6. PERFORMANCE MONITORING QUERIES
-- ==============================================

-- Create view for monitoring slow queries
CREATE OR REPLACE VIEW public.performance_monitoring AS
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY n_distinct DESC;

-- ==============================================
-- 7. ROW LEVEL SECURITY OPTIMIZATION
-- ==============================================

-- Optimize RLS policies for better performance
-- These policies are already created but we can add indexes to support them

-- Add partial indexes for RLS
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_id_active ON public.orders(user_id) WHERE status != 'cancelled';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_cafe_id_active ON public.orders(cafe_id) WHERE status != 'cancelled';

-- ==============================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ==============================================

COMMENT ON MATERIALIZED VIEW public.daily_cafe_orders IS 'Daily order analytics for cafes - refreshed daily';
COMMENT ON MATERIALIZED VIEW public.user_activity_summary IS 'User activity summary for loyalty calculations - refreshed daily';
COMMENT ON FUNCTION public.refresh_analytics_views() IS 'Refreshes all analytics materialized views';
COMMENT ON FUNCTION public.cleanup_old_notifications() IS 'Removes notifications older than 30 days';
COMMENT ON FUNCTION public.archive_old_orders() IS 'Archives completed orders older than 1 year';

-- ==============================================
-- 9. SCHEDULED JOBS (to be set up in Supabase)
-- ==============================================

-- These should be set up as cron jobs in Supabase:
-- 1. Refresh materialized views daily at 2 AM
-- 2. Cleanup old notifications weekly
-- 3. Archive old orders monthly

-- Example cron expressions:
-- Daily refresh: '0 2 * * *' (2 AM daily)
-- Weekly cleanup: '0 3 * * 0' (3 AM on Sundays)
-- Monthly archive: '0 4 1 * *' (4 AM on 1st of each month)
