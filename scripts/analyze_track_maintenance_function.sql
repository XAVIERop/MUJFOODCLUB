-- =====================================================
-- Analyze track_maintenance_spending Function
-- =====================================================

-- 1. Get the function definition to see what it does
SELECT 
  '=== FUNCTION DEFINITION ===' as section,
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'track_maintenance_spending';

-- 2. Check if it modifies loyalty points or cafe_loyalty_points
SELECT 
  '=== FUNCTION ANALYSIS ===' as section,
  CASE 
    WHEN routine_definition LIKE '%loyalty_points%' THEN 'CONFLICTS - modifies loyalty points'
    WHEN routine_definition LIKE '%cafe_loyalty_points%' THEN 'CONFLICTS - modifies cafe loyalty points'
    WHEN routine_definition LIKE '%total_spent%' THEN 'CONFLICTS - modifies total spent'
    WHEN routine_definition LIKE '%INSERT%' OR routine_definition LIKE '%UPDATE%' THEN 'POTENTIAL CONFLICT - modifies data'
    ELSE 'SAFE - likely just calculations'
  END as conflict_assessment,
  routine_name
FROM information_schema.routines 
WHERE routine_name = 'track_maintenance_spending';

-- 3. Check what tables it might be modifying
SELECT 
  '=== TABLE MODIFICATIONS ===' as section,
  CASE 
    WHEN routine_definition LIKE '%profiles%' THEN 'Modifies profiles table'
    WHEN routine_definition LIKE '%cafe_loyalty_points%' THEN 'Modifies cafe_loyalty_points table'
    WHEN routine_definition LIKE '%orders%' THEN 'Modifies orders table'
    ELSE 'No table modifications detected'
  END as table_impact,
  routine_name
FROM information_schema.routines 
WHERE routine_name = 'track_maintenance_spending';
