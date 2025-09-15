-- =====================================================
-- Complete System Simplification
-- Remove all rewards system components
-- =====================================================

-- 1. Disable all rewards-related triggers
DROP TRIGGER IF EXISTS new_rewards_order_completion_trigger ON public.orders;
DROP TRIGGER IF EXISTS handle_new_user_first_order_trigger ON public.orders;
DROP TRIGGER IF EXISTS cafe_loyalty_order_completion_trigger ON public.orders;
DROP TRIGGER IF EXISTS order_status_update_trigger ON public.orders;
DROP TRIGGER IF EXISTS order_completion_simple_trigger ON public.orders;
DROP TRIGGER IF EXISTS track_maintenance_spending_trigger ON public.orders;
DROP TRIGGER IF EXISTS order_operations_final_trigger ON public.orders;

-- 2. Drop rewards-related functions
DROP FUNCTION IF EXISTS handle_new_rewards_order_completion();
DROP FUNCTION IF EXISTS handle_new_user_first_order();
DROP FUNCTION IF EXISTS handle_cafe_loyalty_order_completion();
DROP FUNCTION IF EXISTS handle_order_status_update();
DROP FUNCTION IF EXISTS handle_order_completion_simple();
DROP FUNCTION IF EXISTS track_maintenance_spending();
DROP FUNCTION IF EXISTS handle_order_operations_final();
DROP FUNCTION IF EXISTS calculate_cafe_tier();
DROP FUNCTION IF EXISTS get_tier_discount();
DROP FUNCTION IF EXISTS calculate_points_earned();
DROP FUNCTION IF EXISTS get_cafe_loyalty_discount();
DROP FUNCTION IF EXISTS calculate_cafe_loyalty_level();
DROP FUNCTION IF EXISTS update_cafe_loyalty_points();
DROP FUNCTION IF EXISTS get_user_cafe_loyalty_summary();
DROP FUNCTION IF EXISTS initialize_cafe_loyalty_for_existing_users();
DROP FUNCTION IF EXISTS migrate_existing_loyalty_to_cafe_specific();
DROP FUNCTION IF EXISTS update_enhanced_loyalty_tier();
DROP FUNCTION IF EXISTS update_loyalty_tier();

-- 3. Remove rewards-related columns from orders table
ALTER TABLE public.orders DROP COLUMN IF EXISTS points_earned;
ALTER TABLE public.orders DROP COLUMN IF EXISTS points_credited;

-- 4. Verify remaining triggers (should only have essential ones)
SELECT 
    '=== REMAINING TRIGGERS ON ORDERS TABLE ===' as section,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders' 
AND event_object_schema = 'public'
ORDER BY trigger_name;

-- 5. Verify remaining functions (should only have essential ones)
SELECT 
    '=== REMAINING FUNCTIONS ===' as section,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%order%'
ORDER BY routine_name;

-- 6. Show cleaned orders table structure
SELECT 
    '=== CLEANED ORDERS TABLE STRUCTURE ===' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Show column count
SELECT 
    '=== COLUMN COUNT ===' as section,
    COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public';

-- 8. Success message
SELECT 
    '=== SIMPLIFICATION COMPLETE ===' as section,
    'All rewards system components have been removed' as status,
    'System is now ready for simplified order processing' as message;
