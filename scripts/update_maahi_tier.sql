-- =====================================================
-- Update Maahi's Tier Based on 30-Day Spending
-- =====================================================

-- 1. Calculate her correct tier
SELECT 
  '=== MAHI TIER CALCULATION ===' as section,
  900.00 as total_spent_last_30_days,
  calculate_cafe_tier(900.00) as calculated_tier,
  get_tier_discount(calculate_cafe_tier(900.00)) as discount_percentage;

-- 2. Update Maahi's cafe loyalty data with correct tier
UPDATE public.cafe_loyalty_points 
SET 
  current_tier = 'foodie', -- ₹900 < ₹3500, so Foodie tier
  monthly_spend_30_days = 900.00,
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM public.profiles WHERE email = 'maahi.229301245@muj.manipal.edu'
);

-- 3. Verify the update
SELECT 
  '=== VERIFICATION - MAHI UPDATED ===' as section,
  clp.points,
  clp.total_spent,
  clp.current_tier,
  clp.monthly_spend_30_days,
  get_tier_discount(clp.current_tier) as discount_percentage,
  CASE 
    WHEN clp.monthly_spend_30_days >= 6500 THEN 'Connoisseur (₹6500+)'
    WHEN clp.monthly_spend_30_days >= 3500 THEN 'Gourmet (₹3500-₹6499)'
    ELSE 'Foodie (₹0-₹3499)'
  END as tier_explanation
FROM public.cafe_loyalty_points clp
LEFT JOIN public.profiles p ON clp.user_id = p.id
WHERE p.email = 'maahi.229301245@muj.manipal.edu';

-- 4. Show what Maahi needs for next tier
SELECT 
  '=== NEXT TIER REQUIREMENTS ===' as section,
  'Current: Foodie (₹900 spent)' as current_status,
  'Need ₹2600 more for Gourmet tier' as gourmet_requirement,
  'Need ₹5600 more for Connoisseur tier' as connoisseur_requirement;
