-- Simple performance metrics function that definitely works
-- This is a fallback if the complex one doesn't work

-- Drop existing function
DROP FUNCTION IF EXISTS get_system_performance_metrics();

-- Create a simple version
CREATE OR REPLACE FUNCTION get_system_performance_metrics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_orders_today', COALESCE(COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE), 0),
    'active_cafes', COALESCE(COUNT(DISTINCT cafe_id) FILTER (WHERE created_at >= CURRENT_DATE), 0),
    'avg_order_value', COALESCE(AVG(total_amount) FILTER (WHERE created_at >= CURRENT_DATE), 0),
    'peak_hour', COALESCE(
      (SELECT EXTRACT(HOUR FROM created_at)::INTEGER
       FROM public.orders
       WHERE created_at >= CURRENT_DATE
       GROUP BY EXTRACT(HOUR FROM created_at)
       ORDER BY COUNT(*) DESC
       LIMIT 1), 0
    )
  ) INTO result
  FROM public.orders;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_system_performance_metrics() TO authenticated;

-- Test the function
SELECT get_system_performance_metrics();
