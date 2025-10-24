-- Test script to verify referral system database connection
-- Run this after creating the tables to ensure everything is working

-- 1. Test referral codes table
SELECT 'Referral Codes Table Test' as test_name;
SELECT COUNT(*) as total_codes FROM public.referral_codes;
SELECT * FROM public.referral_codes LIMIT 5;

-- 2. Test users table new columns
SELECT 'Users Table New Columns Test' as test_name;
SELECT 
    id, 
    email, 
    referral_code_used, 
    referral_usage_count, 
    referred_by 
FROM public.users 
LIMIT 3;

-- 3. Test orders table new columns
SELECT 'Orders Table New Columns Test' as test_name;
SELECT 
    id, 
    order_number, 
    referral_code_used, 
    discount_amount, 
    team_member_credit 
FROM public.orders 
LIMIT 3;

-- 4. Test team member performance table
SELECT 'Team Member Performance Table Test' as test_name;
SELECT COUNT(*) as total_performance_records FROM public.team_member_performance;

-- 5. Test referral usage tracking table
SELECT 'Referral Usage Tracking Table Test' as test_name;
SELECT COUNT(*) as total_tracking_records FROM public.referral_usage_tracking;

-- 6. Test validation function
SELECT 'Validation Function Test' as test_name;
SELECT validate_referral_code('TEAM001') as team001_valid;
SELECT validate_referral_code('INVALID') as invalid_code;

-- 7. Test user limit function (will return true for new users)
SELECT 'User Limit Function Test' as test_name;
SELECT check_user_referral_limit('00000000-0000-0000-0000-000000000000') as limit_check;

-- 8. Test reward calculation function
SELECT 'Reward Calculation Function Test' as test_name;
SELECT calculate_team_member_reward(25) as reward_25_orders;
SELECT calculate_team_member_reward(75) as reward_75_orders;
SELECT calculate_team_member_reward(150) as reward_150_orders;

-- 9. Test indexes
SELECT 'Index Test' as test_name;
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('referral_codes', 'users', 'orders', 'team_member_performance', 'referral_usage_tracking')
ORDER BY tablename, indexname;
