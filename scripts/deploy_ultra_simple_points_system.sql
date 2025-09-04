-- Deploy Ultra Simple Points System
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Update the points calculation function to be ultra simple
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
  -- Set points rate based on tier only
  CASE user_tier
    WHEN 'connoisseur' THEN points_rate := 10; -- 10% points
    WHEN 'gourmet' THEN points_rate := 5;     -- 5% points
    ELSE points_rate := 5;                    -- 5% points for foodie
  END CASE;
  
  -- Very simple: just base points (no multipliers, no bonuses)
  base_points := FLOOR((order_amount * points_rate) / 100);
  
  RETURN base_points;
END;
$$ LANGUAGE plpgsql;

-- 2. Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_new_points(DECIMAL, TEXT, BOOLEAN, INTEGER) TO authenticated, anon;

-- 3. Test the ultra simple system
SELECT 
  'Test 1: ₹500 Foodie Order' as test_case,
  calculate_new_points(500, 'foodie', true, 1) as points_earned,
  'Expected: 25 points (5% of ₹500)' as expected;

SELECT 
  'Test 2: ₹1000 Foodie Order' as test_case,
  calculate_new_points(1000, 'foodie', true, 1) as points_earned,
  'Expected: 50 points (5% of ₹1000)' as expected;

SELECT 
  'Test 3: ₹1000 Connoisseur Order' as test_case,
  calculate_new_points(1000, 'connoisseur', true, 1) as points_earned,
  'Expected: 100 points (10% of ₹1000)' as expected;

-- 4. Verify no multipliers exist
SELECT 
  'Function source check:' as info,
  prosrc as function_source
FROM pg_proc 
WHERE proname = 'calculate_new_points';
