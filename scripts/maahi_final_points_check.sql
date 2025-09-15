-- =====================================================
-- Maahi's Final Points Check
-- =====================================================

-- Check Maahi's corrected points
SELECT 
  '=== MAHI FINAL POINTS STATUS ===' as section,
  clp.points as cafe_points,
  clp.total_spent as cafe_spent,
  clp.current_tier,
  clp.monthly_spend_30_days,
  c.name as cafe_name,
  'CORRECTED FROM 1432 POINTS' as correction_note
FROM public.cafe_loyalty_points clp
JOIN public.cafes c ON clp.cafe_id = c.id
WHERE clp.user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d';
