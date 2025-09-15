-- =====================================================
-- Check Tier Discount and Interfering Function
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

-- 3. Check the potentially interfering function
SELECT 
  '=== INTERFERING FUNCTION: handle_new_rewards_order_completion ===' as section,
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_rewards_order_completion';

-- 4. Check if there's a get_cafe_loyalty_discount function that might be used by frontend
SELECT 
  '=== CAFE LOYALTY DISCOUNT FUNCTION ===' as section,
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'get_cafe_loyalty_discount';
