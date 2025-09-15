-- =====================================================
-- Check order_operations_final Function
-- =====================================================

-- Check what handle_order_operations_final function does
SELECT 
  '=== ORDER OPERATIONS FINAL FUNCTION ===' as section,
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_order_operations_final';
