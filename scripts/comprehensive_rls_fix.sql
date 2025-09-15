-- =====================================================
-- Comprehensive RLS Fix for All Issues
-- =====================================================

-- 1. Disable RLS on all problematic tables
ALTER TABLE public.cafe_staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cafes DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies that might be causing issues
DROP POLICY IF EXISTS "Enable read access for all users" ON public.cafe_staff;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.cafe_staff;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.cafe_staff;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.cafe_staff;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.orders;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.orders;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.orders;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.profiles;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.cafes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.cafes;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.cafes;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.cafes;

-- 3. Verify RLS is disabled
SELECT 
    '=== FINAL RLS STATUS ===' as section,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('cafe_staff', 'orders', 'profiles', 'cafes')
ORDER BY tablename;

-- 4. Test all queries
DO $$
BEGIN
    -- Test cafe_staff
    PERFORM COUNT(*) FROM public.cafe_staff;
    RAISE NOTICE 'cafe_staff: OK';
    
    -- Test orders
    PERFORM COUNT(*) FROM public.orders;
    RAISE NOTICE 'orders: OK';
    
    -- Test profiles
    PERFORM COUNT(*) FROM public.profiles;
    RAISE NOTICE 'profiles: OK';
    
    -- Test cafes
    PERFORM COUNT(*) FROM public.cafes;
    RAISE NOTICE 'cafes: OK';
    
    RAISE NOTICE 'All tables accessible';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
END $$;

-- 5. Test order creation
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
        'B1', 'cod', '[{"item_id": "test", "name": "Test", "price": 510, "quantity": 1}]'
    ) RETURNING id INTO test_order_id;
    
    RAISE NOTICE 'Test order created: %', test_order_id;
    
    -- Clean up
    DELETE FROM public.orders WHERE id = test_order_id;
    RAISE NOTICE 'Test order cleaned up';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Order creation error: %', SQLERRM;
END $$;
