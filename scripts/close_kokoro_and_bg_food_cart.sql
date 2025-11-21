-- Close Kokoro and BG The Food Cart cafes
-- This will stop them from accepting orders

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
WHERE LOWER(name) IN ('kokoro', 'koko-ro', 'bg the food cart', 'bg-the-food-cart');

-- ============================================
-- STEP 2: Close the cafes (set accepting_orders = false)
-- ============================================
UPDATE public.cafes
SET 
  accepting_orders = false,
  updated_at = NOW()
WHERE LOWER(name) IN ('kokoro', 'koko-ro', 'bg the food cart', 'bg-the-food-cart')
RETURNING 
  name,
  accepting_orders,
  is_active,
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
WHERE LOWER(name) IN ('kokoro', 'koko-ro', 'bg the food cart', 'bg-the-food-cart');

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

