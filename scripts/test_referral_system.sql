-- Test the referral system implementation
-- Run this in Supabase SQL Editor to verify everything is working

-- 1. Check if all tables exist
SELECT 'Tables Check' as test_name;
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('referral_codes', 'team_member_performance', 'referral_usage_tracking') THEN 'Referral System'
        WHEN table_name IN ('users', 'orders', 'profiles') THEN 'Base System'
        ELSE 'Other'
    END as table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('referral_codes', 'team_member_performance', 'referral_usage_tracking', 'users', 'orders', 'profiles')
ORDER BY table_type, table_name;

-- 2. Check referral codes
SELECT 'Referral Codes' as test_name;
SELECT code, team_member_name, is_active FROM public.referral_codes ORDER BY code;

-- 3. Test validation function
SELECT 'Function Tests' as test_name;
SELECT 
    'PULKIT123' as code,
    validate_referral_code('PULKIT123') as is_valid
UNION ALL
SELECT 
    'INVALID' as code,
    validate_referral_code('INVALID') as is_valid
UNION ALL
SELECT 
    'TEAM002' as code,
    validate_referral_code('TEAM002') as is_valid;

-- 4. Test reward calculation
SELECT 'Reward Calculation' as test_name;
SELECT 
    '25 orders' as scenario,
    calculate_team_member_reward(25) as reward_per_order
UNION ALL
SELECT 
    '75 orders' as scenario,
    calculate_team_member_reward(75) as reward_per_order
UNION ALL
SELECT 
    '150 orders' as scenario,
    calculate_team_member_reward(150) as reward_per_order;

-- 5. Check if users table has referral columns
SELECT 'Users Table Columns' as test_name;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND table_schema = 'public'
    AND column_name IN ('referral_code_used', 'referral_usage_count', 'referred_by')
ORDER BY column_name;

-- 6. Check if orders table has referral columns
SELECT 'Orders Table Columns' as test_name;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
    AND table_schema = 'public'
    AND column_name IN ('referral_code_used', 'discount_amount', 'team_member_credit')
ORDER BY column_name;

-- 7. Test indexes
SELECT 'Indexes Check' as test_name;
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('referral_codes', 'users', 'orders', 'team_member_performance', 'referral_usage_tracking')
    AND schemaname = 'public'
ORDER BY tablename, indexname;

-- 8. Summary
SELECT 'System Status' as test_name;
SELECT 
    'Referral System Ready!' as status,
    (SELECT COUNT(*) FROM public.referral_codes) as total_codes,
    (SELECT COUNT(*) FROM public.team_member_performance) as performance_records,
    (SELECT COUNT(*) FROM public.referral_usage_tracking) as usage_records;
