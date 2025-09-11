-- Fix the get_system_performance_metrics function
-- The issue is that it returns multiple rows but we need a single row

-- Drop the existing function
DROP FUNCTION IF EXISTS get_system_performance_metrics();

-- Create the corrected function that returns a single row
CREATE OR REPLACE FUNCTION get_system_performance_metrics()
RETURNS TABLE (
  total_orders_today BIGINT,
  active_cafes BIGINT,
  avg_order_value NUMERIC,
  peak_hour INTEGER
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
    ) as peak_hour;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_system_performance_metrics() TO authenticated;

-- Test the function
SELECT * FROM get_system_performance_metrics();
