-- Update Points System to Remove Multipliers
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Update the calculate_new_points function to remove multipliers
CREATE OR REPLACE FUNCTION calculate_new_points(
  order_amount DECIMAL,
  user_tier TEXT,
  is_new_user BOOLEAN DEFAULT FALSE,
  new_user_orders_count INTEGER DEFAULT 0
)
RETURNS INTEGER AS $$
DECLARE
  points_rate INTEGER;
  base_points INTEGER;
BEGIN
  -- Set points rate based on tier
  CASE user_tier
    WHEN 'connoisseur' THEN points_rate := 10; -- 10% points
    WHEN 'gourmet' THEN points_rate := 5;     -- 5% points
    ELSE points_rate := 5;                    -- 5% points for foodie
  END CASE;
  
  -- Calculate base points (no multipliers)
  base_points := FLOOR((order_amount * points_rate) / 100);
  
  RETURN base_points;
END;
$$ LANGUAGE plpgsql;

-- 2. Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_new_points(DECIMAL, TEXT, BOOLEAN, INTEGER) TO authenticated, anon;

-- 3. Test the function with different scenarios
SELECT 
  'Test 1: ₹1000 Foodie' as test_case,
  calculate_new_points(1000, 'foodie', true, 1) as points_earned;

SELECT 
  'Test 2: ₹1000 Gourmet' as test_case,
  calculate_new_points(1000, 'gourmet', true, 1) as points_earned;

SELECT 
  'Test 3: ₹1000 Connoisseur' as test_case,
  calculate_new_points(1000, 'connoisseur', true, 1) as points_earned;

-- 4. Verify the function is working correctly
-- Expected results:
-- Test 1: 50 points (₹1000 × 5%)
-- Test 2: 50 points (₹1000 × 5%) 
-- Test 3: 100 points (₹1000 × 10%)
