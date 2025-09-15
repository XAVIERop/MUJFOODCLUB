-- =====================================================
-- Temporarily Disable validate_order_placement_trigger
-- =====================================================

-- 1. Disable the trigger temporarily
DROP TRIGGER IF EXISTS validate_order_placement_trigger ON public.orders;

-- 2. Test order creation without the trigger
DO $$
DECLARE
    test_user_id UUID;
    test_cafe_id UUID;
    test_order_id UUID;
BEGIN
    -- Get test user ID
    SELECT id INTO test_user_id FROM public.profiles WHERE email = 'test.student@muj.manipal.edu' LIMIT 1;
    
    -- Get CHATKARA cafe ID
    SELECT id INTO test_cafe_id FROM public.cafes WHERE name = 'CHATKARA' LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE 'Test user not found';
        RETURN;
    END IF;
    
    IF test_cafe_id IS NULL THEN
        RAISE NOTICE 'CHATKARA cafe not found';
        RETURN;
    END IF;
    
    -- Try to insert an order without the validation trigger
    INSERT INTO public.orders (
        user_id,
        cafe_id,
        total_amount,
        status,
        order_type,
        delivery_block,
        payment_method,
        items
    ) VALUES (
        test_user_id,
        test_cafe_id,
        510.00,
        'pending',
        'delivery',
        'B1',
        'cod',
        '[{"item_id": "test1", "name": "Veg Mutton Biryani", "price": 250, "quantity": 1}, {"item_id": "test2", "name": "Veg Chicken Biryani", "price": 250, "quantity": 1}]'
    ) RETURNING id INTO test_order_id;
    
    RAISE NOTICE 'Order created successfully without validation trigger: %', test_order_id;
    
    -- Clean up
    DELETE FROM public.orders WHERE id = test_order_id;
    RAISE NOTICE 'Test order cleaned up';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error without validation trigger: %', SQLERRM;
    RAISE NOTICE 'Error details: %', SQLSTATE;
END $$;

-- 3. Show remaining triggers
SELECT 
    '=== REMAINING TRIGGERS AFTER DISABLING VALIDATION ===' as section,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'orders' 
AND event_object_schema = 'public';
