-- =====================================================
-- DEEP SYSTEM AUDIT - Check All Rewards Systems
-- =====================================================

-- 1. Check ALL triggers on orders table
SELECT 
  '=== ALL TRIGGERS ON ORDERS TABLE ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
ORDER BY trigger_name;

-- 2. Check ALL functions that might handle order completion
SELECT 
  '=== ALL ORDER COMPLETION FUNCTIONS ===' as section,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name LIKE '%completion%'
   OR routine_name LIKE '%order%'
   OR routine_name LIKE '%status%'
ORDER BY routine_name;

-- 3. Check if old conflicting functions still exist
SELECT 
  '=== OLD CONFLICTING FUNCTIONS ===' as section,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name IN (
  'handle_order_status_update',
  'handle_cafe_loyalty_order_completion',
  'update_cafe_loyalty_points',
  'handle_order_completion_simple',
  'handle_new_rewards_order_completion'
)
ORDER BY routine_name;

-- 4. Check what functions are actually being called by triggers
SELECT 
  '=== TRIGGER FUNCTION MAPPING ===' as section,
  t.trigger_name,
  t.action_statement,
  r.routine_name as function_name
FROM information_schema.triggers t
LEFT JOIN information_schema.routines r ON t.action_statement LIKE '%' || r.routine_name || '%'
WHERE t.event_object_table = 'orders'
  AND t.trigger_name LIKE '%completion%'
ORDER BY t.trigger_name;

-- 5. Check if there are multiple triggers firing on the same event
SELECT 
  '=== TRIGGERS BY EVENT TYPE ===' as section,
  event_manipulation,
  action_timing,
  COUNT(*) as trigger_count,
  STRING_AGG(trigger_name, ', ') as trigger_names
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
GROUP BY event_manipulation, action_timing
ORDER BY event_manipulation, action_timing;
