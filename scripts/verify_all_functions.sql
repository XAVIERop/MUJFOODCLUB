-- =====================================================
-- Verify All Rewards Functions Are Working
-- =====================================================

-- 1. Test all our rewards functions
SELECT 
  '=== FUNCTION TESTS ===' as section,
  calculate_cafe_tier(900.00) as tier_for_900,
  calculate_cafe_tier(4000.00) as tier_for_4000,
  calculate_cafe_tier(7000.00) as tier_for_7000;

SELECT 
  '=== DISCOUNT TESTS ===' as section,
  get_tier_discount('foodie') as foodie_discount,
  get_tier_discount('gourmet') as gourmet_discount,
  get_tier_discount('connoisseur') as connoisseur_discount;

SELECT 
  '=== POINTS TESTS ===' as section,
  calculate_points_earned(500.00) as points_for_500,
  calculate_points_earned(100.00) as points_for_100,
  calculate_points_earned(1000.00) as points_for_1000;

-- 2. Verify all functions exist
SELECT 
  '=== ALL REWARDS FUNCTIONS STATUS ===' as section,
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

-- 3. Check Maahi's current status
SELECT 
  '=== MAHI STATUS (FINAL) ===' as section,
  p.email,
  clp.points,
  clp.total_spent,
  clp.current_tier,
  clp.monthly_spend_30_days,
  get_tier_discount(clp.current_tier) as discount_percentage
FROM public.profiles p
LEFT JOIN public.cafe_loyalty_points clp ON p.id = clp.user_id
WHERE p.email = 'maahi.229301245@muj.manipal.edu';
