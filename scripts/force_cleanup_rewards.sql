-- =====================================================
-- FORCE Cleanup Rewards Functions
-- Handle dependencies and force removal
-- =====================================================

-- 1. First, let's see what's actually there
SELECT 
    '=== CURRENT REWARDS FUNCTIONS ===' as section,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND (
    routine_name LIKE '%loyalty%' OR 
    routine_name LIKE '%points%' OR 
    routine_name LIKE '%tier%' OR 
    routine_name LIKE '%reward%'
)
ORDER BY routine_name;

-- 2. Force drop with CASCADE to handle dependencies
DROP FUNCTION IF EXISTS public.calculate_cafe_tier() CASCADE;
DROP FUNCTION IF EXISTS public.get_tier_discount() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_points_earned() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_cafe_loyalty_summary() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_cafe_loyalty_level() CASCADE;
DROP FUNCTION IF EXISTS public.get_cafe_loyalty_discount() CASCADE;
DROP FUNCTION IF EXISTS public.update_cafe_loyalty_points() CASCADE;

-- 3. Drop any remaining rewards-related triggers with CASCADE
DROP TRIGGER IF EXISTS new_rewards_order_completion_trigger ON public.orders CASCADE;
DROP TRIGGER IF EXISTS handle_new_user_first_order_trigger ON public.orders CASCADE;
DROP TRIGGER IF EXISTS cafe_loyalty_order_completion_trigger ON public.orders CASCADE;
DROP TRIGGER IF EXISTS order_status_update_trigger ON public.orders CASCADE;
DROP TRIGGER IF EXISTS order_completion_simple_trigger ON public.orders CASCADE;
DROP TRIGGER IF EXISTS track_maintenance_spending_trigger ON public.orders CASCADE;
DROP TRIGGER IF EXISTS order_operations_final_trigger ON public.orders CASCADE;

-- 4. Drop any remaining rewards-related functions with CASCADE
DROP FUNCTION IF EXISTS public.handle_new_rewards_order_completion() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_first_order() CASCADE;
DROP FUNCTION IF EXISTS public.handle_cafe_loyalty_order_completion() CASCADE;
DROP FUNCTION IF EXISTS public.handle_order_status_update() CASCADE;
DROP FUNCTION IF EXISTS public.handle_order_completion_simple() CASCADE;
DROP FUNCTION IF EXISTS public.track_maintenance_spending() CASCADE;
DROP FUNCTION IF EXISTS public.handle_order_operations_final() CASCADE;

-- 5. Check what's left after force cleanup
SELECT 
    '=== REMAINING FUNCTIONS AFTER FORCE CLEANUP ===' as section,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND (
    routine_name LIKE '%loyalty%' OR 
    routine_name LIKE '%points%' OR 
    routine_name LIKE '%tier%' OR 
    routine_name LIKE '%reward%'
)
ORDER BY routine_name;

-- 6. Test order creation after force cleanup
DO $$
DECLARE
    test_user_id UUID;
    test_cafe_id UUID;
    test_order_id UUID;
BEGIN
    -- Get test user
    SELECT id INTO test_user_id FROM public.profiles WHERE email = 'test.student@muj.manipal.edu' LIMIT 1;
    
    -- Get CHATKARA
    SELECT id INTO test_cafe_id FROM public.cafes WHERE name = 'CHATKARA' LIMIT 1;
    
    IF test_user_id IS NULL OR test_cafe_id IS NULL THEN
        RAISE NOTICE 'Test data not found';
        RETURN;
    END IF;
    
    -- Create test order
    INSERT INTO public.orders (
        user_id, cafe_id, total_amount, status, order_type, 
        delivery_block, payment_method, items
    ) VALUES (
        test_user_id, test_cafe_id, 510.00, 'pending', 'delivery',
        'B1', 'cod', '[{"item_id": "test1", "name": "Veg Mutton Biryani", "price": 250, "quantity": 1}, {"item_id": "test2", "name": "Veg Chicken Biryani", "price": 250, "quantity": 1}]'
    ) RETURNING id INTO test_order_id;
    
    RAISE NOTICE '✅ FORCE CLEANUP: Order created successfully: %', test_order_id;
    
    -- Clean up
    DELETE FROM public.orders WHERE id = test_order_id;
    RAISE NOTICE '✅ FORCE CLEANUP: Test order cleaned up';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ FORCE CLEANUP: Order creation failed: %', SQLERRM;
END $$;

-- 7. Final status
SELECT 
    '=== FORCE CLEANUP COMPLETE ===' as section,
    'All rewards functions force-removed with CASCADE' as status,
    'Check Supabase linter again' as message;
