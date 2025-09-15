-- =====================================================
-- Fix Constants File
-- =====================================================

-- This is a note for the frontend fix
SELECT 
  '=== FRONTEND CONSTANTS NEED TO BE FIXED ===' as section,
  'File: src/lib/constants.ts' as file,
  'MAX_REDEMPTION_PERCENTAGE: 10' as bug1,
  'Should be: MAX_REDEMPTION_PERCENTAGE: 5' as fix1,
  'TIER_REQUIREMENTS.GOURMET: 2500' as bug2,
  'Should be: TIER_REQUIREMENTS.GOURMET: 3500' as fix2,
  'TIER_REQUIREMENTS.CONNOISSEUR: 5000' as bug3,
  'Should be: TIER_REQUIREMENTS.CONNOISSEUR: 6500' as fix3,
  'TIER_DISCOUNTS.FOODIE: 5' as bug4,
  'Should be: TIER_DISCOUNTS.FOODIE: 0' as fix4,
  'TIER_DISCOUNTS.GOURMET: 7.5' as bug5,
  'Should be: TIER_DISCOUNTS.GOURMET: 7' as fix5;
