-- =====================================================
-- Fix Dependency Error - Drop Triggers First
-- =====================================================

-- 1. Drop all triggers that depend on the functions we want to drop
DROP TRIGGER IF EXISTS update_enhanced_loyalty_tier_trigger ON public.profiles;
DROP TRIGGER IF EXISTS update_loyalty_tier_trigger ON public.profiles;
DROP TRIGGER IF EXISTS handle_cafe_loyalty_order_completion_trigger ON public.orders;

-- 2. Now drop the functions (they should work now)
DROP FUNCTION IF EXISTS handle_cafe_loyalty_order_completion();
DROP FUNCTION IF EXISTS initialize_cafe_loyalty_for_existing_users();
DROP FUNCTION IF EXISTS migrate_existing_loyalty_to_cafe_specific();
DROP FUNCTION IF EXISTS update_enhanced_loyalty_tier();
DROP FUNCTION IF EXISTS update_loyalty_tier();

-- 3. Verify all triggers and functions are dropped
SELECT 
    '=== REMAINING TRIGGERS ON PROFILES ===' as section,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'profiles'
ORDER BY trigger_name;

SELECT 
    '=== REMAINING TRIGGERS ON ORDERS ===' as section,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
ORDER BY trigger_name;

-- 4. Check if any functions still exist
SELECT 
    '=== REMAINING FUNCTIONS ===' as section,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN (
    'handle_cafe_loyalty_order_completion',
    'initialize_cafe_loyalty_for_existing_users',
    'migrate_existing_loyalty_to_cafe_specific',
    'update_enhanced_loyalty_tier',
    'update_loyalty_tier'
)
ORDER BY routine_name;
