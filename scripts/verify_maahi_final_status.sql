-- =====================================================
-- Verify Maahi's Final Status with New Rewards System
-- =====================================================

-- 1. Check Maahi's updated data
SELECT 
  '=== MAHI FINAL STATUS ===' as section,
  p.email,
  p.loyalty_points as profile_points,
  p.total_spent as profile_spent,
  clp.points as cafe_points,
  clp.total_spent as cafe_spent,
  clp.current_tier,
  clp.monthly_spend_30_days,
  get_tier_discount(clp.current_tier) as discount_percentage
FROM public.profiles p
LEFT JOIN public.cafe_loyalty_points clp ON p.id = clp.user_id
WHERE p.email = 'maahi.229301245@muj.manipal.edu';

-- 2. Show tier requirements
SELECT 
  '=== TIER REQUIREMENTS ===' as section,
  'Foodie: ₹0-₹3499 (0% discount)' as foodie_requirements,
  'Gourmet: ₹3500-₹6499 (7% discount)' as gourmet_requirements,
  'Connoisseur: ₹6500+ (10% discount)' as connoisseur_requirements;

-- 3. Show what Maahi needs for next tier
SELECT 
  '=== MAHI NEXT TIER PROGRESS ===' as section,
  clp.monthly_spend_30_days as current_spending,
  (3500 - clp.monthly_spend_30_days) as needed_for_gourmet,
  (6500 - clp.monthly_spend_30_days) as needed_for_connoisseur
FROM public.cafe_loyalty_points clp
LEFT JOIN public.profiles p ON clp.user_id = p.id
WHERE p.email = 'maahi.229301245@muj.manipal.edu';
