-- =====================================================
-- Fix Missing calculate_points_earned Function
-- =====================================================

-- 1. Check if the function exists
SELECT 
  '=== FUNCTION STATUS CHECK ===' as section,
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_name = 'calculate_points_earned';

-- 2. Create the missing function
CREATE OR REPLACE FUNCTION calculate_points_earned(final_amount DECIMAL(10,2))
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN FLOOR(final_amount * 0.05);
END;
$$;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION calculate_points_earned TO authenticated;

-- 4. Test the function
SELECT 
  '=== FUNCTION TEST ===' as section,
  calculate_points_earned(500.00) as points_for_500,
  calculate_points_earned(100.00) as points_for_100,
  calculate_points_earned(1000.00) as points_for_1000;

-- 5. Verify all our functions exist
SELECT 
  '=== ALL REWARDS FUNCTIONS ===' as section,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name IN (
  'calculate_cafe_tier',
  'get_tier_discount', 
  'calculate_points_earned',
  'handle_new_rewards_order_completion'
)
ORDER BY routine_name;
