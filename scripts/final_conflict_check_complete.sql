-- =====================================================
-- Final Conflict Check - Complete
-- =====================================================

-- Check if any triggers still modify loyalty data
SELECT 
  '=== FINAL CONFLICT CHECK ===' as section,
  trigger_name,
  action_statement,
  CASE 
    WHEN action_statement LIKE '%loyalty%' THEN 'POTENTIAL CONFLICT'
    WHEN action_statement LIKE '%points%' THEN 'POTENTIAL CONFLICT'
    WHEN action_statement LIKE '%spent%' THEN 'POTENTIAL CONFLICT'
    ELSE 'SAFE'
  END as conflict_assessment
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
  AND event_manipulation = 'UPDATE'
ORDER BY trigger_name;
