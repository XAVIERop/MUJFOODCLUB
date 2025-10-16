-- Safe test to verify referral system connection
-- This only reads data, doesn't modify anything

-- Test 1: Check if referral codes are accessible
SELECT 'Referral Codes Test' as test_name;
SELECT 
    code,
    team_member_name,
    is_active,
    created_at
FROM public.referral_codes 
ORDER BY code;

-- Test 2: Check if functions work
SELECT 'Function Tests' as test_name;
SELECT 
    'PULKIT123' as code,
    validate_referral_code('PULKIT123') as is_valid,
    'Should be true' as expected
UNION ALL
SELECT 
    'INVALID' as code,
    validate_referral_code('INVALID') as is_valid,
    'Should be false' as expected;

-- Test 3: Check table structure
SELECT 'Table Structure' as test_name;
SELECT 
    'referral_codes' as table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'referral_codes' AND table_schema = 'public'
UNION ALL
SELECT 
    'team_member_performance' as table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'team_member_performance' AND table_schema = 'public'
UNION ALL
SELECT 
    'referral_usage_tracking' as table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'referral_usage_tracking' AND table_schema = 'public';

-- Test 4: Check if we can read existing tables (safety check)
SELECT 'Safety Check - Existing Tables' as test_name;
SELECT 
    table_name,
    'Safe to read' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'orders', 'profiles', 'cafes')
ORDER BY table_name;
