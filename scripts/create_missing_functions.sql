-- =====================================================
-- Create Missing Functions for New Rewards System
-- =====================================================

-- 1. Create function to calculate cafe-specific tier
CREATE OR REPLACE FUNCTION calculate_cafe_tier(spent_last_30_days DECIMAL(10,2))
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    IF spent_last_30_days >= 6500 THEN
        RETURN 'connoisseur';
    ELSIF spent_last_30_days >= 3500 THEN
        RETURN 'gourmet';
    ELSE
        RETURN 'foodie';
    END IF;
END;
$$;

-- 2. Create function to get tier discount percentage
CREATE OR REPLACE FUNCTION get_tier_discount(tier TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
    CASE tier
        WHEN 'connoisseur' THEN RETURN 10;
        WHEN 'gourmet' THEN RETURN 7;
        ELSE RETURN 0; -- foodie
    END CASE;
END;
$$;

-- 3. Create function to calculate points earned (5% of final amount)
CREATE OR REPLACE FUNCTION calculate_points_earned(final_amount DECIMAL(10,2))
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN FLOOR(final_amount * 0.05);
END;
$$;

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION calculate_cafe_tier TO authenticated;
GRANT EXECUTE ON FUNCTION get_tier_discount TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_points_earned TO authenticated;

-- 5. Test the functions
SELECT 
  '=== FUNCTION TEST ===' as section,
  calculate_cafe_tier(900.00) as tier_for_900,
  get_tier_discount('foodie') as foodie_discount,
  get_tier_discount('gourmet') as gourmet_discount,
  get_tier_discount('connoisseur') as connoisseur_discount,
  calculate_points_earned(500.00) as points_for_500;
