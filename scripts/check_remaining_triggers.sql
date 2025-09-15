-- =====================================================
-- Check Remaining UPDATE Triggers
-- =====================================================

-- 1. Check all remaining UPDATE triggers
SELECT 
  '=== ALL REMAINING UPDATE TRIGGERS ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
  AND event_manipulation = 'UPDATE'
ORDER BY trigger_name;

-- 2. Check if any of these might still conflict
SELECT 
  '=== POTENTIAL CONFLICTS CHECK ===' as section,
  trigger_name,
  CASE 
    WHEN trigger_name LIKE '%completion%' THEN 'MIGHT CONFLICT - handles order completion'
    WHEN trigger_name LIKE '%maintenance%' THEN 'MIGHT CONFLICT - handles spending tracking'
    WHEN trigger_name LIKE '%operations%' THEN 'MIGHT CONFLICT - handles order operations'
    WHEN trigger_name LIKE '%notification%' THEN 'SAFE - only handles notifications'
    WHEN trigger_name LIKE '%processing%' THEN 'SAFE - only handles timing'
    WHEN trigger_name LIKE '%updated_at%' THEN 'SAFE - only updates timestamps'
    ELSE 'UNKNOWN - needs investigation'
  END as conflict_assessment
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
  AND event_manipulation = 'UPDATE'
ORDER BY trigger_name;

-- 3. Count total triggers
SELECT 
  '=== TRIGGER COUNT ===' as section,
  COUNT(*) as total_triggers,
  COUNT(CASE WHEN event_manipulation = 'UPDATE' THEN 1 END) as update_triggers,
  COUNT(CASE WHEN event_manipulation = 'INSERT' THEN 1 END) as insert_triggers
FROM information_schema.triggers 
WHERE event_object_table = 'orders';
