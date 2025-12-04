-- Close Koko, BG The Food Cart, and Food Court cafes
-- This will set accepting_orders = false for these specific cafes

-- ============================================
-- STEP 1: Check current status
-- ============================================
SELECT 
  '🔍 CURRENT STATUS:' as section,
  name,
  slug,
  is_active,
  accepting_orders,
  CASE 
    WHEN accepting_orders = true THEN '✅ Currently OPEN'
    ELSE '❌ Currently CLOSED'
  END as status
FROM public.cafes
WHERE LOWER(name) LIKE '%kokoro%'
   OR LOWER(name) LIKE '%koko-ro%'
   OR LOWER(name) LIKE '%koko%'
   OR LOWER(name) LIKE '%bg the food cart%'
   OR LOWER(name) LIKE '%bg-the-food-cart%'
   OR LOWER(name) LIKE '%food court%'
   OR slug IN ('kokoro', 'koko-ro', 'koko', 'bg-the-food-cart', 'food-court')
ORDER BY name;

-- ============================================
-- STEP 2: Close the cafes (set accepting_orders = false)
-- ============================================
UPDATE public.cafes
SET 
  accepting_orders = false,
  updated_at = NOW()
WHERE LOWER(name) LIKE '%kokoro%'
   OR LOWER(name) LIKE '%koko-ro%'
   OR LOWER(name) LIKE '%koko%'
   OR LOWER(name) LIKE '%bg the food cart%'
   OR LOWER(name) LIKE '%bg-the-food-cart%'
   OR LOWER(name) LIKE '%food court%'
   OR slug IN ('kokoro', 'koko-ro', 'koko', 'bg-the-food-cart', 'food-court')
RETURNING 
  name,
  slug,
  accepting_orders,
  is_active,
  updated_at,
  '✅ CLOSED' as new_status;

-- ============================================
-- STEP 3: Verify the changes
-- ============================================
SELECT 
  '✅ VERIFICATION:' as section,
  name,
  slug,
  is_active,
  accepting_orders,
  updated_at,
  CASE 
    WHEN accepting_orders = false THEN '✅ Successfully CLOSED'
    ELSE '⚠️ Still OPEN (unexpected!)'
  END as verification_status
FROM public.cafes
WHERE LOWER(name) LIKE '%kokoro%'
   OR LOWER(name) LIKE '%koko-ro%'
   OR LOWER(name) LIKE '%koko%'
   OR LOWER(name) LIKE '%bg the food cart%'
   OR LOWER(name) LIKE '%bg-the-food-cart%'
   OR LOWER(name) LIKE '%food court%'
   OR slug IN ('kokoro', 'koko-ro', 'koko', 'bg-the-food-cart', 'food-court')
ORDER BY name;

-- ============================================
-- SUMMARY
-- ============================================
SELECT 
  '📊 SUMMARY:' as section,
  COUNT(*) as total_cafes_found,
  COUNT(*) FILTER (WHERE accepting_orders = false) as closed_cafes,
  COUNT(*) FILTER (WHERE accepting_orders = true) as still_open_cafes
FROM public.cafes
WHERE LOWER(name) LIKE '%kokoro%'
   OR LOWER(name) LIKE '%koko-ro%'
   OR LOWER(name) LIKE '%koko%'
   OR LOWER(name) LIKE '%bg the food cart%'
   OR LOWER(name) LIKE '%bg-the-food-cart%'
   OR LOWER(name) LIKE '%food court%'
   OR slug IN ('kokoro', 'koko-ro', 'koko', 'bg-the-food-cart', 'food-court');

-- ============================================
-- NOTE:
-- ============================================
-- This query sets accepting_orders = false, which:
-- - Stops new orders from being placed
-- - Keeps the cafe visible on the app but marked as "not accepting orders"
-- - Does NOT deactivate the cafe completely (is_active remains true)
--
-- If you want to completely hide the cafes from the app, also set is_active = false
-- If you want to reopen them later, just set accepting_orders = true

