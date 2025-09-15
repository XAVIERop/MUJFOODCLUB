-- =====================================================
-- Test Order Creation After Simplification
-- =====================================================

-- 1. Check if orders table structure is intact
SELECT 
    '=== ORDERS TABLE STRUCTURE ===' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
AND column_name IN ('id', 'user_id', 'cafe_id', 'total_amount', 'status', 'items')
ORDER BY ordinal_position;

-- 2. Check if we can insert a test order
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
    
    -- Try to insert a test order
    INSERT INTO public.orders (
        user_id,
        cafe_id,
        total_amount,
        status,
        items,
        order_type,
        delivery_block,
        payment_method
    ) VALUES (
        test_user_id,
        test_cafe_id,
        510.00,
        'pending',
        '[{"item_id": "test", "name": "Test Item", "price": 250, "quantity": 2}]',
        'delivery',
        'B1',
        'cod'
    ) RETURNING id INTO test_order_id;
    
    RAISE NOTICE 'Test order created successfully with ID: %', test_order_id;
    
    -- Clean up test order
    DELETE FROM public.orders WHERE id = test_order_id;
    RAISE NOTICE 'Test order cleaned up';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating test order: %', SQLERRM;
END $$;

-- 3. Check for any missing constraints or triggers
SELECT 
    '=== ORDERS TABLE CONSTRAINTS ===' as section,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'orders' 
AND table_schema = 'public';

-- 4. Check remaining triggers on orders table
SELECT 
    '=== REMAINING TRIGGERS ===' as section,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'orders' 
AND event_object_schema = 'public';
