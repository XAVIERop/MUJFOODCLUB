-- Test what database we're currently connected to
-- Run this to see what tables exist

-- 1. Check current database info
SELECT 'Current Database Info' as test_name;
SELECT 
    current_database() as database_name,
    current_user as current_user,
    version() as postgres_version;

-- 2. List all tables in public schema
SELECT 'Available Tables' as test_name;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 3. Check if this looks like production or referral branch
SELECT 'Branch Type Check' as test_name;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'referral_codes' AND table_schema = 'public') 
        THEN 'This is the REFERRAL-SYSTEM branch'
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cafes' AND table_schema = 'public') 
        THEN 'This is the PRODUCTION branch'
        ELSE 'Unknown branch - missing key tables'
    END as branch_type;
