-- =====================================================
-- Debug Frontend Discount Calculation
-- =====================================================

-- 1. Test our database functions to confirm they're correct
SELECT 
  '=== DATABASE FUNCTIONS TEST ===' as section,
  get_tier_discount('foodie') as tier_discount,
  get_cafe_loyalty_discount(1) as loyalty_discount,
  'Both should be 0 for foodie' as expected;

-- 2. Check if there are any other functions that might be used by frontend
SELECT 
  '=== ALL FUNCTIONS WITH TIER OR FOODIE ===' as section,
  routine_name,
  routine_type,
  CASE 
    WHEN routine_definition LIKE '%foodie%' AND routine_definition LIKE '%discount%' THEN 'MIGHT BE USED BY FRONTEND'
    WHEN routine_definition LIKE '%tier%' AND routine_definition LIKE '%discount%' THEN 'MIGHT BE USED BY FRONTEND'
    ELSE 'PROBABLY SAFE'
  END as frontend_risk
FROM information_schema.routines 
WHERE (routine_definition LIKE '%foodie%' OR routine_definition LIKE '%tier%')
  AND routine_definition LIKE '%discount%'
ORDER BY frontend_risk DESC, routine_name;

-- 3. Check if there are any RPC functions that might be called by frontend
SELECT 
  '=== RPC FUNCTIONS THAT MIGHT BE CALLED BY FRONTEND ===' as section,
  routine_name,
  routine_type,
  security_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%discount%'
  OR routine_name LIKE '%tier%'
  OR routine_name LIKE '%loyalty%'
ORDER BY routine_name;

-- 4. Check what the frontend might be calling for discount calculation
SELECT 
  '=== POTENTIAL FRONTEND FUNCTIONS ===' as section,
  'Frontend might be calling get_user_cafe_loyalty_summary' as note1,
  'Or get_cafe_loyalty_discount directly' as note2,
  'Or using cached values' as note3;
