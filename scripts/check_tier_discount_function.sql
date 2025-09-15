-- =====================================================
-- Check Tier Discount Function
-- =====================================================

-- 1. Check if our get_tier_discount function is correct
SELECT 
  '=== TIER DISCOUNT FUNCTION CHECK ===' as section,
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'get_tier_discount';

-- 2. Test the function with different tiers
SELECT 
  '=== TIER DISCOUNT TEST ===' as section,
  get_tier_discount('foodie') as foodie_discount,
  get_tier_discount('gourmet') as gourmet_discount,
  get_tier_discount('connoisseur') as connoisseur_discount,
  'Should be 0, 7, 10 respectively' as expected;

-- 3. Check if there are any other functions that might be calculating discounts
SELECT 
  '=== ALL FUNCTIONS WITH DISCOUNT ===' as section,
  routine_name,
  routine_type,
  CASE 
    WHEN routine_definition LIKE '%discount%' AND routine_definition LIKE '%foodie%' THEN 'MIGHT BE INTERFERING'
    WHEN routine_definition LIKE '%tier%' AND routine_definition LIKE '%discount%' THEN 'MIGHT BE INTERFERING'
    ELSE 'PROBABLY SAFE'
  END as interference_risk
FROM information_schema.routines 
WHERE routine_definition LIKE '%discount%'
ORDER BY interference_risk DESC, routine_name;
