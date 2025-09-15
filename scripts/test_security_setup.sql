-- =====================================================
-- 🧪 SECURITY TESTING SCRIPT
-- =====================================================
-- This script tests the security setup to ensure
-- everything is working correctly

-- =====================================================
-- TEST 1: VERIFY RLS IS ENABLED
-- =====================================================

SELECT 
    'RLS Status Check' as test_name,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('orders', 'profiles', 'cafes', 'menu_items', 'order_items', 'loyalty_transactions', 'cafe_staff', 'order_notifications', 'promotional_banners')
ORDER BY tablename;

-- =====================================================
-- TEST 2: COUNT POLICIES PER TABLE
-- =====================================================

SELECT 
    'Policy Count Check' as test_name,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- TEST 3: VERIFY INDEXES EXIST
-- =====================================================

SELECT 
    'Index Check' as test_name,
    indexname,
    tablename
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- =====================================================
-- TEST 4: TEST UNAUTHENTICATED ACCESS (Should Fail)
-- =====================================================

-- This should fail if RLS is working
DO $$
BEGIN
    BEGIN
        -- Try to access orders without authentication
        PERFORM * FROM public.orders LIMIT 1;
        RAISE WARNING '❌ SECURITY ISSUE: Unauthenticated access to orders table succeeded!';
    EXCEPTION
        WHEN insufficient_privilege THEN
            RAISE NOTICE '✅ SECURITY WORKING: Unauthenticated access to orders table blocked';
        WHEN OTHERS THEN
            RAISE WARNING '❓ UNEXPECTED ERROR: %', SQLERRM;
    END;
END $$;

-- =====================================================
-- TEST 5: VERIFY SECURITY FUNCTIONS EXIST
-- =====================================================

SELECT 
    'Security Functions Check' as test_name,
    proname as function_name,
    prokind as function_type
FROM pg_proc 
WHERE proname IN ('validate_order_placement', 'log_security_event')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- =====================================================
-- TEST 6: VERIFY TRIGGERS EXIST
-- =====================================================

SELECT 
    'Trigger Check' as test_name,
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%security%' OR trigger_name LIKE '%audit%'
ORDER BY event_object_table;

-- =====================================================
-- TEST 7: CHECK AUDIT LOGS TABLE
-- =====================================================

SELECT 
    'Audit Logs Table Check' as test_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'audit_logs'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- SUMMARY REPORT
-- =====================================================

DO $$
DECLARE
    rls_count INTEGER;
    policy_count INTEGER;
    index_count INTEGER;
    function_count INTEGER;
    trigger_count INTEGER;
BEGIN
    -- Count RLS enabled tables
    SELECT COUNT(*) INTO rls_count
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND rowsecurity = true
    AND tablename IN ('orders', 'profiles', 'cafes', 'menu_items', 'order_items', 'loyalty_transactions', 'cafe_staff', 'order_notifications', 'promotional_banners');
    
    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    -- Count security indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%';
    
    -- Count security functions
    SELECT COUNT(*) INTO function_count
    FROM pg_proc 
    WHERE proname IN ('validate_order_placement', 'log_security_event')
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    
    -- Count security triggers
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public'
    AND (trigger_name LIKE '%security%' OR trigger_name LIKE '%audit%');
    
    RAISE NOTICE '';
    RAISE NOTICE '🛡️ SECURITY SETUP SUMMARY:';
    RAISE NOTICE '========================';
    RAISE NOTICE 'Tables with RLS enabled: %', rls_count;
    RAISE NOTICE 'Security policies created: %', policy_count;
    RAISE NOTICE 'Performance indexes: %', index_count;
    RAISE NOTICE 'Security functions: %', function_count;
    RAISE NOTICE 'Security triggers: %', trigger_count;
    RAISE NOTICE '';
    
    IF rls_count >= 9 AND policy_count >= 20 THEN
        RAISE NOTICE '🎉 SECURITY SETUP: EXCELLENT!';
        RAISE NOTICE '✅ All critical tables are protected';
        RAISE NOTICE '✅ Comprehensive policies are in place';
    ELSIF rls_count >= 6 AND policy_count >= 10 THEN
        RAISE NOTICE '⚠️ SECURITY SETUP: GOOD';
        RAISE NOTICE '✅ Most tables are protected';
        RAISE NOTICE '⚠️ Some policies may be missing';
    ELSE
        RAISE NOTICE '❌ SECURITY SETUP: NEEDS ATTENTION';
        RAISE NOTICE '⚠️ Not all tables are properly secured';
        RAISE NOTICE '⚠️ Please run the comprehensive security fix';
    END IF;
    
    RAISE NOTICE '';
END $$;
