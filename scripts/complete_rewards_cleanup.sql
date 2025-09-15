-- =====================================================
-- Complete Rewards System Cleanup
-- Remove ALL remaining rewards-related functions
-- =====================================================

-- 1. Drop ALL remaining rewards-related functions
DROP FUNCTION IF EXISTS public.calculate_cafe_tier();
DROP FUNCTION IF EXISTS public.get_tier_discount();
DROP FUNCTION IF EXISTS public.calculate_points_earned();
DROP FUNCTION IF EXISTS public.get_user_cafe_loyalty_summary();
DROP FUNCTION IF EXISTS public.calculate_cafe_loyalty_level();
DROP FUNCTION IF EXISTS public.get_cafe_loyalty_discount();
DROP FUNCTION IF EXISTS public.update_cafe_loyalty_points();

-- 2. Drop any remaining rewards-related triggers
DROP TRIGGER IF EXISTS new_rewards_order_completion_trigger ON public.orders;
DROP TRIGGER IF EXISTS handle_new_user_first_order_trigger ON public.orders;
DROP TRIGGER IF EXISTS cafe_loyalty_order_completion_trigger ON public.orders;
DROP TRIGGER IF EXISTS order_status_update_trigger ON public.orders;
DROP TRIGGER IF EXISTS order_completion_simple_trigger ON public.orders;
DROP TRIGGER IF EXISTS track_maintenance_spending_trigger ON public.orders;
DROP TRIGGER IF EXISTS order_operations_final_trigger ON public.orders;

-- 3. Drop any remaining rewards-related functions
DROP FUNCTION IF EXISTS public.handle_new_rewards_order_completion();
DROP FUNCTION IF EXISTS public.handle_new_user_first_order();
DROP FUNCTION IF EXISTS public.handle_cafe_loyalty_order_completion();
DROP FUNCTION IF EXISTS public.handle_order_status_update();
DROP FUNCTION IF EXISTS public.handle_order_completion_simple();
DROP FUNCTION IF EXISTS public.track_maintenance_spending();
DROP FUNCTION IF EXISTS public.handle_order_operations_final();

-- 4. Verify all rewards functions are removed
SELECT 
    '=== REMAINING FUNCTIONS CHECK ===' as section,
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

-- 5. Verify all rewards triggers are removed
SELECT 
    '=== REMAINING TRIGGERS CHECK ===' as section,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'orders' 
AND event_object_schema = 'public'
ORDER BY trigger_name;

-- 6. Test order creation after cleanup
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
    
    RAISE NOTICE '✅ Order created successfully: %', test_order_id;
    
    -- Clean up
    DELETE FROM public.orders WHERE id = test_order_id;
    RAISE NOTICE '✅ Test order cleaned up';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Order creation failed: %', SQLERRM;
END $$;

-- 7. Final verification
SELECT 
    '=== CLEANUP COMPLETE ===' as section,
    'All rewards functions and triggers removed' as status,
    'Order creation should now work' as message;
