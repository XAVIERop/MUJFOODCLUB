-- SAFE MIGRATION: Copy essential data from production to referral-system branch
-- This script only ADDS data, doesn't modify existing tables

-- Step 1: Check current state
SELECT 'Current Branch Status' as step;
SELECT 
    'Tables in referral branch' as info,
    COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Step 2: Check if we have referral tables
SELECT 'Referral System Status' as step;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'referral_codes') 
        THEN 'Referral system tables exist'
        ELSE 'Referral system tables missing'
    END as status;

-- Step 3: Check if we have basic tables
SELECT 'Basic Tables Check' as step;
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('cafes', 'menu_items', 'orders', 'profiles') 
        THEN 'Essential table exists'
        ELSE 'Optional table'
    END as importance
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('cafes', 'menu_items', 'orders', 'profiles', 'referral_codes', 'team_member_performance')
ORDER BY importance DESC, table_name;
