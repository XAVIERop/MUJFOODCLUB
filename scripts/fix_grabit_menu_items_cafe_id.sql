-- Fix Grabit Menu Items cafe_id Issue
-- PROBLEM: Some Grabit items (especially Kurkure Momos) have wrong cafe_id
-- SOLUTION: Update all Grabit items to have correct Grabit cafe_id
-- This fixes orders going to wrong POS dashboards

-- ============================================
-- STEP 1: Verify Grabit cafe_id
-- ============================================
SELECT 
  '🔍 GRABIT CAFE INFO:' as section,
  id as grabit_cafe_id,
  name as cafe_name,
  slug as cafe_slug,
  type as cafe_type
FROM public.cafes 
WHERE LOWER(name) LIKE '%grabit%' OR LOWER(slug) = 'grabit';

-- Expected: cfa083d5-c030-45e8-9ead-980aaa0aa7d2

-- ============================================
-- STEP 2: Show items with WRONG cafe_id
-- ============================================
SELECT 
  '❌ ITEMS WITH WRONG CAFE_ID:' as section,
  mi.name as item_name,
  mi.cafe_id as wrong_cafe_id,
  c.name as currently_assigned_to,
  mi.category,
  mi.is_available
FROM public.menu_items mi
LEFT JOIN public.cafes c ON mi.cafe_id = c.id
WHERE (
  -- Kurkure Momos items
  mi.name ILIKE '%kurkure%momo%' OR
  mi.name ILIKE '%kurkure momos%' OR
  
  -- Ringo Bingo (Havmor ice cream should be Grabit chips)
  (mi.name ILIKE '%ringo%bingo%' AND mi.category = 'ICE CREAM')
)
AND mi.cafe_id != 'cfa083d5-c030-45e8-9ead-980aaa0aa7d2'
ORDER BY mi.name;

-- ============================================
-- STEP 3: Count affected items
-- ============================================
SELECT 
  '📊 AFFECTED ITEMS COUNT:' as section,
  COUNT(*) as total_items_to_fix
FROM public.menu_items
WHERE (
  name ILIKE '%kurkure%momo%' OR
  name ILIKE '%kurkure momos%' OR
  (name ILIKE '%ringo%bingo%' AND category = 'ICE CREAM')
)
AND cafe_id != 'cfa083d5-c030-45e8-9ead-980aaa0aa7d2';

-- ============================================
-- STEP 4: FIX - Update items to correct Grabit cafe_id
-- ============================================
DO $$
DECLARE
  grabit_cafe_id UUID := 'cfa083d5-c030-45e8-9ead-980aaa0aa7d2';
  updated_count INTEGER;
BEGIN
  -- Update Kurkure Momos items
  UPDATE public.menu_items
  SET 
    cafe_id = grabit_cafe_id,
    updated_at = NOW()
  WHERE (
    name ILIKE '%kurkure%momo%' OR
    name ILIKE '%kurkure momos%'
  )
  AND cafe_id != grabit_cafe_id;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % Kurkure Momos items to Grabit', updated_count;
  
  -- Update Ringo Bingo (if it's ice cream, it's wrongly categorized)
  UPDATE public.menu_items
  SET 
    cafe_id = grabit_cafe_id,
    category = 'CHIPS', -- Fix category too
    updated_at = NOW()
  WHERE name ILIKE '%ringo%bingo%' 
  AND category = 'ICE CREAM'
  AND cafe_id != grabit_cafe_id;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % Ringo Bingo items to Grabit', updated_count;
  
END $$;

-- ============================================
-- STEP 5: Verify the fix
-- ============================================
SELECT 
  '✅ VERIFICATION AFTER FIX:' as section,
  mi.name as item_name,
  mi.cafe_id as cafe_id,
  c.name as cafe_name,
  CASE 
    WHEN c.name ILIKE '%grabit%' THEN '✅ FIXED!'
    ELSE '❌ Still wrong'
  END as status
FROM public.menu_items mi
LEFT JOIN public.cafes c ON mi.cafe_id = c.id
WHERE (
  mi.name ILIKE '%kurkure%momo%' OR
  mi.name ILIKE '%kurkure momos%' OR
  mi.name ILIKE '%ringo%bingo%'
)
ORDER BY status DESC, mi.name;

-- ============================================
-- STEP 6: Check for any other Grabit items with wrong cafe_id
-- ============================================
SELECT 
  '🔍 OTHER POTENTIAL ISSUES:' as section,
  mi.name as item_name,
  mi.cafe_id,
  c.name as assigned_cafe,
  mi.category
FROM public.menu_items mi
LEFT JOIN public.cafes c ON mi.cafe_id = c.id
WHERE (
  -- Items that sound like they should be Grabit but aren't
  (mi.name ILIKE '%lays%' OR 
   mi.name ILIKE '%kurkure%' OR 
   mi.name ILIKE '%bingo%' OR
   mi.name ILIKE '%doritos%' OR
   mi.name ILIKE '%cheetos%' OR
   mi.name ILIKE '%uncle chips%')
  AND mi.cafe_id != 'cfa083d5-c030-45e8-9ead-980aaa0aa7d2'
)
ORDER BY mi.name;

-- ============================================
-- FINAL SUMMARY
-- ============================================
SELECT 
  '📊 FINAL SUMMARY:' as section,
  COUNT(*) as total_grabit_items,
  COUNT(CASE WHEN cafe_id = 'cfa083d5-c030-45e8-9ead-980aaa0aa7d2' THEN 1 END) as correct_cafe_id,
  COUNT(CASE WHEN cafe_id != 'cfa083d5-c030-45e8-9ead-980aaa0aa7d2' THEN 1 END) as wrong_cafe_id
FROM public.menu_items
WHERE (
  name ILIKE '%lays%' OR 
  name ILIKE '%kurkure%' OR 
  name ILIKE '%bingo%' OR 
  name ILIKE '%chips%' OR
  name ILIKE '%grabit%'
);

RAISE NOTICE '🎉 Grabit menu items cafe_id fix completed!';
RAISE NOTICE '📝 Please verify the results above';
RAISE NOTICE '⚠️  If you see any items still with wrong cafe_id, they may need manual review';

