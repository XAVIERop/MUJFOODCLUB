-- =====================================================
-- Check Active Triggers Only
-- =====================================================

-- Check which triggers are actually active on orders table
SELECT 
  '=== ACTIVE TRIGGERS ON ORDERS ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
  AND event_manipulation = 'UPDATE'
ORDER BY trigger_name;
