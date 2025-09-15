-- =====================================================
-- Check validate_order_placement_trigger
-- =====================================================

-- 1. Get the trigger function definition
SELECT 
    '=== VALIDATE_ORDER_PLACEMENT FUNCTION ===' as section,
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name = 'validate_order_placement';

-- 2. Check if the function exists and what it does
SELECT 
    '=== FUNCTION EXISTS CHECK ===' as section,
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name = 'validate_order_placement';

-- 3. Test the trigger by trying to insert a simple order
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
    
    -- Try to insert a minimal order to test the trigger
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
        100.00,
        'pending',
        'delivery',
        'B1',
        'cod',
        '[{"item_id": "test", "name": "Test Item", "price": 100, "quantity": 1}]'
    ) RETURNING id INTO test_order_id;
    
    RAISE NOTICE 'Minimal order created successfully with ID: %', test_order_id;
    
    -- Clean up
    DELETE FROM public.orders WHERE id = test_order_id;
    RAISE NOTICE 'Test order cleaned up';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error with minimal order: %', SQLERRM;
    RAISE NOTICE 'Error details: %', SQLSTATE;
END $$;
