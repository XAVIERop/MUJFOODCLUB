-- =====================================================
-- AUDIT: Check All Active Rewards Systems
-- =====================================================

-- 1. Check all triggers on orders table
SELECT 
  '=== ACTIVE TRIGGERS ON ORDERS TABLE ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
ORDER BY trigger_name;

-- 2. Check all functions related to rewards/loyalty
SELECT 
  '=== REWARDS/LOYALTY FUNCTIONS ===' as section,
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_name LIKE '%loyalty%' 
   OR routine_name LIKE '%reward%' 
   OR routine_name LIKE '%points%'
   OR routine_name LIKE '%tier%'
ORDER BY routine_name;

-- 3. Check all tables related to rewards/loyalty
SELECT 
  '=== REWARDS/LOYALTY TABLES ===' as section,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name LIKE '%loyalty%' 
   OR table_name LIKE '%reward%' 
   OR table_name LIKE '%points%'
   OR table_name LIKE '%tier%'
   OR table_name LIKE '%bonus%'
ORDER BY table_name;

-- 4. Check if old conflicting functions still exist
SELECT 
  '=== POTENTIAL CONFLICTING FUNCTIONS ===' as section,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name IN (
  'handle_order_status_update',
  'handle_cafe_loyalty_order_completion',
  'update_cafe_loyalty_points',
  'handle_new_rewards_order_completion'
)
ORDER BY routine_name;

-- 5. Check migration files that created rewards systems
SELECT 
  '=== REWARDS SYSTEM MIGRATIONS ===' as section,
  'Multiple migration files found that implement rewards systems' as note,
  'Need to check which ones are actually active' as status;
