-- Close Koko'ro cafe
-- This will stop it from accepting orders

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
WHERE slug = 'kokoro';

-- ============================================
-- STEP 2: Close Koko'ro (set accepting_orders = false)
-- ============================================
UPDATE public.cafes
SET 
  accepting_orders = false,
  updated_at = NOW()
WHERE slug = 'kokoro'
RETURNING 
  name,
  slug,
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
WHERE slug = 'kokoro';

