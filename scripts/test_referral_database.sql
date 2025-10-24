-- Test script to check referral system database connection and data
-- Run this in Supabase SQL Editor to verify everything is working

-- 1. Check if referral_codes table exists and has data
SELECT 'Referral Codes Table Check' as test_name;
SELECT COUNT(*) as total_codes FROM public.referral_codes;

-- 2. Show all referral codes
SELECT 'All Referral Codes' as test_name;
SELECT code, team_member_name, is_active FROM public.referral_codes ORDER BY code;

-- 3. Test specific code PULKIT123
SELECT 'PULKIT123 Validation Test' as test_name;
SELECT * FROM public.referral_codes WHERE code = 'PULKIT123' AND is_active = true;

-- 4. Test the validation function
SELECT 'Validation Function Test' as test_name;
SELECT validate_referral_code('PULKIT123') as pulkit_valid;
SELECT validate_referral_code('INVALID123') as invalid_test;

-- 5. Check if all tables exist
SELECT 'Table Existence Check' as test_name;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('referral_codes', 'team_member_performance', 'referral_usage_tracking')
ORDER BY table_name;

-- 6. Check table structures
SELECT 'Referral Codes Table Structure' as test_name;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'referral_codes' AND table_schema = 'public'
ORDER BY ordinal_position;
