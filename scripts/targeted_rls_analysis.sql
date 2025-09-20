-- TARGETED RLS POLICY ANALYSIS FOR MUJ FOOD CLUB
-- This script analyzes RLS policies in detail to identify conflicts and issues
-- Run this in Supabase SQL Editor to understand policy problems

-- ==============================================
-- 1. DETAILED RLS POLICY ANALYSIS
-- ==============================================

SELECT '=== DETAILED RLS POLICY ANALYSIS ===' as section;

-- Show all policies with their exact conditions
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual as condition,
    with_check as with_check_condition
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ==============================================
-- 2. POLICY CONFLICTS ANALYSIS
-- ==============================================

SELECT '=== POLICY CONFLICTS ANALYSIS ===' as section;

-- Find tables with multiple policies for the same command
SELECT 
    tablename,
    cmd,
    COUNT(*) as policy_count,
    STRING_AGG(policyname, ', ') as policy_names
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename, cmd
HAVING COUNT(*) > 1
ORDER BY policy_count DESC, tablename;

-- ==============================================
-- 3. RECURSIVE POLICY DEPENDENCIES
-- ==============================================

SELECT '=== RECURSIVE POLICY DEPENDENCIES ===' as section;

-- Check for policies that reference other tables (potential recursion)
SELECT 
    p.tablename,
    p.policyname,
    p.qual as condition,
    p.with_check as with_check_condition
FROM pg_policies p
WHERE p.schemaname = 'public'
    AND (
        p.qual LIKE '%cafe_staff%' OR 
        p.qual LIKE '%profiles%' OR
        p.qual LIKE '%cafes%' OR
        p.qual LIKE '%orders%' OR
        p.with_check LIKE '%cafe_staff%' OR
        p.with_check LIKE '%profiles%' OR
        p.with_check LIKE '%cafes%' OR
        p.with_check LIKE '%orders%'
    )
ORDER BY p.tablename, p.policyname;

-- ==============================================
-- 4. TABLES WITH COMPLEX POLICIES
-- ==============================================

SELECT '=== TABLES WITH COMPLEX POLICIES ===' as section;

-- Show tables with the most policies
SELECT 
    tablename,
    COUNT(*) as total_policies,
    COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) as select_policies,
    COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) as insert_policies,
    COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) as update_policies,
    COUNT(CASE WHEN cmd = 'DELETE' THEN 1 END) as delete_policies,
    COUNT(CASE WHEN cmd = 'ALL' THEN 1 END) as all_policies
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY total_policies DESC;

-- ==============================================
-- 5. SPECIFIC ACCESS PATTERN ANALYSIS
-- ==============================================

SELECT '=== SPECIFIC ACCESS PATTERN ANALYSIS ===' as section;

-- Analyze orders table policies specifically
SELECT 'Orders Table Policies:' as info;
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual as condition
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'orders'
ORDER BY cmd, policyname;

-- Analyze order_items table policies specifically
SELECT 'Order Items Table Policies:' as info;
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual as condition
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'order_items'
ORDER BY cmd, policyname;

-- Analyze cafe_staff table policies specifically
SELECT 'Cafe Staff Table Policies:' as info;
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual as condition
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'cafe_staff'
ORDER BY cmd, policyname;

-- ==============================================
-- 6. AUTHENTICATION CONTEXT ANALYSIS
-- ==============================================

SELECT '=== AUTHENTICATION CONTEXT ANALYSIS ===' as section;

-- Check for policies using auth.uid()
SELECT 
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%auth.uid()%' THEN 'Uses auth.uid()'
        ELSE 'Does not use auth.uid()'
    END as auth_usage
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ==============================================
-- 7. POTENTIAL PROBLEMATIC POLICIES
-- ==============================================

SELECT '=== POTENTIAL PROBLEMATIC POLICIES ===' as section;

-- Policies that might cause infinite recursion
SELECT 'Policies with potential recursion issues:' as issue;
SELECT 
    tablename,
    policyname,
    cmd,
    qual as condition
FROM pg_policies 
WHERE schemaname = 'public'
    AND (
        qual LIKE '%cafe_staff%' OR
        qual LIKE '%profiles%' OR
        with_check LIKE '%cafe_staff%' OR
        with_check LIKE '%profiles%'
    )
ORDER BY tablename, policyname;

-- Policies with complex conditions
SELECT 'Policies with complex conditions:' as issue;
SELECT 
    tablename,
    policyname,
    cmd,
    LENGTH(qual) as condition_length,
    qual as condition
FROM pg_policies 
WHERE schemaname = 'public'
    AND LENGTH(qual) > 100
ORDER BY condition_length DESC;

-- ==============================================
-- 8. RECOMMENDED POLICY STRUCTURE
-- ==============================================

SELECT '=== RECOMMENDED POLICY STRUCTURE ===' as section;

-- Show what a clean policy structure should look like
SELECT 'Recommended policy structure for each table:' as info;

-- For profiles table
SELECT 'Profiles table should have:' as table_name, 'Users can view/update own profile' as recommended_policy
UNION ALL
SELECT 'Cafes table should have:', 'Everyone can view, staff can manage'
UNION ALL
SELECT 'Menu items table should have:', 'Everyone can view, staff can manage'
UNION ALL
SELECT 'Orders table should have:', 'Users can view own orders, staff can view cafe orders'
UNION ALL
SELECT 'Order items table should have:', 'Users can view own order items, staff can view cafe order items'
UNION ALL
SELECT 'Cafe staff table should have:', 'Staff can view own records, system can manage'
UNION ALL
SELECT 'Order notifications table should have:', 'Users can view own notifications, staff can view cafe notifications';

-- ==============================================
-- 9. IMMEDIATE ACTION ITEMS
-- ==============================================

SELECT '=== IMMEDIATE ACTION ITEMS ===' as section;

-- Identify policies that need immediate attention
SELECT 'Policies that need immediate attention:' as priority;

-- Check for policies with 'true' conditions (too permissive)
SELECT 'Overly permissive policies (using true):' as issue;
SELECT 
    tablename,
    policyname,
    cmd,
    qual as condition
FROM pg_policies 
WHERE schemaname = 'public'
    AND (qual = 'true' OR with_check = 'true')
ORDER BY tablename, policyname;

-- Check for policies with no conditions (problematic)
SELECT 'Policies with no conditions:' as issue;
SELECT 
    tablename,
    policyname,
    cmd,
    qual as condition
FROM pg_policies 
WHERE schemaname = 'public'
    AND (qual IS NULL OR qual = '' OR with_check IS NULL OR with_check = '')
ORDER BY tablename, policyname;

-- ==============================================
-- 10. SUMMARY AND RECOMMENDATIONS
-- ==============================================

SELECT '=== SUMMARY AND RECOMMENDATIONS ===' as section;

-- Summary of findings
SELECT 
    'Total Policies' as metric,
    COUNT(*) as value
FROM pg_policies 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'Policies with auth.uid()',
    COUNT(*)
FROM pg_policies 
WHERE schemaname = 'public' AND qual LIKE '%auth.uid()%'

UNION ALL

SELECT 
    'Policies with complex conditions',
    COUNT(*)
FROM pg_policies 
WHERE schemaname = 'public' AND LENGTH(qual) > 100

UNION ALL

SELECT 
    'Policies with potential recursion',
    COUNT(*)
FROM pg_policies 
WHERE schemaname = 'public' 
    AND (qual LIKE '%cafe_staff%' OR qual LIKE '%profiles%')

UNION ALL

SELECT 
    'Overly permissive policies',
    COUNT(*)
FROM pg_policies 
WHERE schemaname = 'public' 
    AND (qual = 'true' OR with_check = 'true');
