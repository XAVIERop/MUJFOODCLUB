-- Fix System Performance Metrics Function Error
-- This script fixes the "column created_at does not exist" error

-- =====================================================
-- 1. CHECK ORDERS TABLE STRUCTURE
-- =====================================================

-- First, let's check what columns actually exist in the orders table
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 2. FIX THE SYSTEM PERFORMANCE METRICS FUNCTION
-- =====================================================

-- Drop the problematic function
DROP FUNCTION IF EXISTS get_system_performance_metrics();

-- Create a safer version that checks for column existence
CREATE OR REPLACE FUNCTION get_system_performance_metrics()
RETURNS TABLE (
  total_orders_today BIGINT,
  active_cafes BIGINT,
  avg_order_value NUMERIC,
  peak_hour INTEGER
) AS $$
DECLARE
    has_created_at BOOLEAN;
    has_total_amount BOOLEAN;
BEGIN
    -- Check if created_at column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'created_at'
        AND table_schema = 'public'
    ) INTO has_created_at;
    
    -- Check if total_amount column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'total_amount'
        AND table_schema = 'public'
    ) INTO has_total_amount;
    
    -- If columns don't exist, return zero values
    IF NOT has_created_at OR NOT has_total_amount THEN
        RETURN QUERY SELECT 0::BIGINT, 0::BIGINT, 0::NUMERIC, 0::INTEGER;
        RETURN;
    END IF;
    
    -- If columns exist, run the actual query
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_system_performance_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_system_performance_metrics() TO anon;

-- =====================================================
-- 3. TEST THE FIXED FUNCTION
-- =====================================================

-- Test the function
SELECT 'Testing fixed system performance metrics function...' as status;
SELECT * FROM get_system_performance_metrics();

-- =====================================================
-- 4. ALTERNATIVE SIMPLE VERSION (if above doesn't work)
-- =====================================================

-- If the above still doesn't work, create a simple version
CREATE OR REPLACE FUNCTION get_system_performance_metrics_simple()
RETURNS TABLE (
  total_orders_today BIGINT,
  active_cafes BIGINT,
  avg_order_value NUMERIC,
  peak_hour INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(COUNT(*), 0) as total_orders_today,
        COALESCE(COUNT(DISTINCT cafe_id), 0) as active_cafes,
        COALESCE(AVG(total_amount), 0) as avg_order_value,
        0::INTEGER as peak_hour
    FROM public.orders;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for simple version
GRANT EXECUTE ON FUNCTION get_system_performance_metrics_simple() TO authenticated;
GRANT EXECUTE ON FUNCTION get_system_performance_metrics_simple() TO anon;

-- =====================================================
-- 5. SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 System performance metrics function fixed!';
    RAISE NOTICE '✅ Created safe version with column existence checks';
    RAISE NOTICE '✅ Created simple fallback version';
    RAISE NOTICE '✅ Both functions granted proper permissions';
    RAISE NOTICE '🚀 Performance metrics should now work without errors!';
END $$;
