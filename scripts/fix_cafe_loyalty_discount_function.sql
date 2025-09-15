-- =====================================================
-- Fix Cafe Loyalty Discount Function
-- =====================================================

-- 1. Fix the get_cafe_loyalty_discount function with correct values
CREATE OR REPLACE FUNCTION get_cafe_loyalty_discount(loyalty_level INTEGER)
RETURNS DECIMAL(3,1)
LANGUAGE plpgsql
AS $$
BEGIN
    CASE loyalty_level
        WHEN 3 THEN RETURN 10.0; -- 10% discount (Connoisseur)
        WHEN 2 THEN RETURN 7.0;  -- 7% discount (Gourmet)
        WHEN 1 THEN RETURN 0.0;  -- 0% discount (Foodie)
        ELSE RETURN 0.0;
    END CASE;
END;
$$;

-- 2. Grant permissions
GRANT EXECUTE ON FUNCTION get_cafe_loyalty_discount TO authenticated;

-- 3. Test the fixed function
SELECT 
  '=== FIXED FUNCTION TEST ===' as section,
  get_cafe_loyalty_discount(1) as foodie_discount,
  get_cafe_loyalty_discount(2) as gourmet_discount,
  get_cafe_loyalty_discount(3) as connoisseur_discount,
  'Should be 0.0, 7.0, 10.0 respectively' as expected;

-- 4. Check if there are any other discount functions that need fixing
SELECT 
  '=== OTHER DISCOUNT FUNCTIONS ===' as section,
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%discount%'
  AND routine_name != 'get_cafe_loyalty_discount';

-- 5. Verification
SELECT 
  '=== DISCOUNT FUNCTION FIXED ===' as section,
  'Foodie tier: 0% discount' as fix1,
  'Gourmet tier: 7% discount' as fix2,
  'Connoisseur tier: 10% discount' as fix3,
  'Frontend should now show correct discounts' as status;
