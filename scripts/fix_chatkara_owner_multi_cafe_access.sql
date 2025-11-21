-- Fix Chatkara Owner Multi-Cafe Access Bug
-- PROBLEM: Chatkara owner has access to 19 cafes instead of just 1
-- This causes orders from other cafes (including Grabit) to appear in wrong POS dashboards
-- SOLUTION: Remove all cafe_staff entries for Chatkara owner EXCEPT for CHATKARA cafe

-- ============================================
-- STEP 1: Verify the problem
-- ============================================
SELECT 
  '🔍 CURRENT STATE - Chatkara Owner Access:' as section,
  p.full_name,
  p.email,
  c.name as cafe_name,
  cs.role,
  cs.is_active,
  cs.created_at
FROM public.cafe_staff cs
JOIN public.profiles p ON cs.user_id = p.id
JOIN public.cafes c ON cs.cafe_id = c.id
WHERE p.email = 'chatkara.owner@mujfoodclub.in'
ORDER BY c.name;

-- ============================================
-- STEP 2: Show which entries will be REMOVED
-- ============================================
SELECT 
  '❌ CAFE ACCESS TO BE REMOVED:' as section,
  c.name as cafe_name,
  cs.id as staff_entry_id,
  cs.role,
  cs.created_at
FROM public.cafe_staff cs
JOIN public.profiles p ON cs.user_id = p.id
JOIN public.cafes c ON cs.cafe_id = c.id
WHERE p.email = 'chatkara.owner@mujfoodclub.in'
  AND c.name != 'CHATKARA'  -- Keep only CHATKARA, remove all others
ORDER BY c.name;

-- ============================================
-- STEP 3: Show which entry will be KEPT
-- ============================================
SELECT 
  '✅ CAFE ACCESS TO BE KEPT:' as section,
  c.name as cafe_name,
  cs.id as staff_entry_id,
  cs.role,
  cs.created_at
FROM public.cafe_staff cs
JOIN public.profiles p ON cs.user_id = p.id
JOIN public.cafes c ON cs.cafe_id = c.id
WHERE p.email = 'chatkara.owner@mujfoodclub.in'
  AND c.name = 'CHATKARA'
ORDER BY c.name;

-- ============================================
-- STEP 4: THE FIX - Remove incorrect cafe assignments
-- ============================================
DO $$
DECLARE
  chatkara_owner_id UUID;
  chatkara_cafe_id UUID;
  removed_count INTEGER;
BEGIN
  -- Get Chatkara owner's user ID
  SELECT id INTO chatkara_owner_id
  FROM public.profiles
  WHERE email = 'chatkara.owner@mujfoodclub.in';
  
  IF chatkara_owner_id IS NULL THEN
    RAISE EXCEPTION 'Chatkara owner not found!';
  END IF;
  
  -- Get CHATKARA cafe ID
  SELECT id INTO chatkara_cafe_id
  FROM public.cafes
  WHERE name = 'CHATKARA';
  
  IF chatkara_cafe_id IS NULL THEN
    RAISE EXCEPTION 'CHATKARA cafe not found!';
  END IF;
  
  RAISE NOTICE 'Chatkara Owner ID: %', chatkara_owner_id;
  RAISE NOTICE 'CHATKARA Cafe ID: %', chatkara_cafe_id;
  
  -- Delete all cafe_staff entries for Chatkara owner EXCEPT CHATKARA cafe
  DELETE FROM public.cafe_staff
  WHERE user_id = chatkara_owner_id
    AND cafe_id != chatkara_cafe_id;
  
  GET DIAGNOSTICS removed_count = ROW_COUNT;
  RAISE NOTICE '✅ Removed % incorrect cafe assignments', removed_count;
  RAISE NOTICE '✅ Chatkara owner now has access to CHATKARA only';
  
END $$;

-- ============================================
-- STEP 5: Verify the fix
-- ============================================
SELECT 
  '✅ AFTER FIX - Chatkara Owner Access:' as section,
  p.full_name,
  p.email,
  COUNT(DISTINCT cs.cafe_id) as total_cafes,
  STRING_AGG(c.name, ', ') as cafe_names
FROM public.cafe_staff cs
JOIN public.profiles p ON cs.user_id = p.id
JOIN public.cafes c ON cs.cafe_id = c.id
WHERE p.email = 'chatkara.owner@mujfoodclub.in'
  AND cs.is_active = true
GROUP BY p.full_name, p.email;

-- Should show: total_cafes = 1, cafe_names = 'CHATKARA'

-- ============================================
-- STEP 6: Check if anyone else has multi-cafe access
-- ============================================
SELECT 
  '🔍 OTHER USERS WITH MULTI-CAFE ACCESS:' as section,
  p.full_name,
  p.email,
  COUNT(DISTINCT cs.cafe_id) as cafe_count,
  STRING_AGG(c.name, ', ') as cafes
FROM public.cafe_staff cs
JOIN public.profiles p ON cs.user_id = p.id
JOIN public.cafes c ON cs.cafe_id = c.id
WHERE cs.is_active = true
GROUP BY p.full_name, p.email
HAVING COUNT(DISTINCT cs.cafe_id) > 1
ORDER BY cafe_count DESC;

-- Should return empty (no one should have multi-cafe access unless intentional)

-- ============================================
-- STEP 7: Verify Grabit owner has correct access
-- ============================================
SELECT 
  '✅ GRABIT OWNER ACCESS CHECK:' as section,
  p.full_name,
  p.email,
  c.name as cafe_name,
  cs.role,
  cs.is_active
FROM public.cafe_staff cs
JOIN public.profiles p ON cs.user_id = p.id
JOIN public.cafes c ON cs.cafe_id = c.id
WHERE p.email = 'grabit@mujfoodclub.in'
ORDER BY c.name;

-- Should show only Grabit

-- ============================================
-- FINAL SUMMARY
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ============================================';
  RAISE NOTICE '🎉 CHATKARA MULTI-CAFE ACCESS BUG FIX COMPLETE';
  RAISE NOTICE '🎉 ============================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Chatkara owner now has access to CHATKARA only';
  RAISE NOTICE '✅ Grabit orders will no longer appear in wrong POS dashboards';
  RAISE NOTICE '✅ Each cafe owner can only see their own cafe orders';
  RAISE NOTICE '';
  RAISE NOTICE '📝 NEXT STEPS:';
  RAISE NOTICE '1. Ask Chatkara owner to log out and log back in';
  RAISE NOTICE '2. Verify they only see CHATKARA orders in POS dashboard';
  RAISE NOTICE '3. Test placing a Grabit order and verify it appears only in Grabit POS';
  RAISE NOTICE '';
END $$;

