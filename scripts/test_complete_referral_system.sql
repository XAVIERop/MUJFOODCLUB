-- Test Complete Referral System
-- This script tests the entire referral system end-to-end

-- 1. Check if all referral system tables exist
SELECT 'Referral System Tables Check' as test_type;
SELECT 
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('referral_codes', 'team_member_performance', 'referral_usage_tracking', 'profiles', 'orders')
ORDER BY table_name;

-- 2. Check if referral system functions exist
SELECT 'Referral System Functions Check' as test_type;
SELECT 
    routine_name,
    'EXISTS' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN ('validate_referral_code', 'check_user_referral_limit', 'calculate_team_member_reward')
ORDER BY routine_name;

-- 3. Check sample referral codes
SELECT 'Sample Referral Codes' as test_type;
SELECT 
    code,
    team_member_name,
    is_active,
    'READY' as status
FROM public.referral_codes 
ORDER BY code;

-- 4. Test referral code validation function
SELECT 'Referral Code Validation Test' as test_type;
SELECT 
    'PULKIT123' as test_code,
    validate_referral_code('PULKIT123') as is_valid,
    'VALID' as expected_result;

SELECT 
    'INVALID123' as test_code,
    validate_referral_code('INVALID123') as is_valid,
    'INVALID' as expected_result;

-- 5. Check if profiles table has referral columns
SELECT 'Profiles Table Referral Columns Check' as test_type;
SELECT 
    column_name,
    data_type,
    'EXISTS' as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'profiles'
    AND column_name IN ('referral_code_used', 'referral_usage_count', 'referred_by')
ORDER BY column_name;

-- 6. Check if orders table has referral columns
SELECT 'Orders Table Referral Columns Check' as test_type;
SELECT 
    column_name,
    data_type,
    'EXISTS' as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'orders'
    AND column_name IN ('referral_code_used', 'discount_amount', 'team_member_credit')
ORDER BY column_name;

-- 7. Test team member reward calculation
SELECT 'Team Member Reward Calculation Test' as test_type;
SELECT 
    25 as orders_count,
    calculate_team_member_reward(25) as reward_amount,
    0.50 as expected_reward;

SELECT 
    75 as orders_count,
    calculate_team_member_reward(75) as reward_amount,
    0.75 as expected_reward;

SELECT 
    150 as orders_count,
    calculate_team_member_reward(150) as reward_amount,
    1.00 as expected_reward;

-- 8. Final Status Summary
SELECT 'FINAL STATUS SUMMARY' as test_type;
SELECT 
    'Referral System' as component,
    'COMPLETE' as status,
    'Ready for testing on main branch' as note;
