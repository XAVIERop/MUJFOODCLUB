-- COMPREHENSIVE DATABASE ANALYSIS FOR MUJ FOOD CLUB
-- This script analyzes the entire database structure, relationships, and current state
-- Run this in Supabase SQL Editor to understand the complete architecture

-- ==============================================
-- 1. DATABASE SCHEMA OVERVIEW
-- ==============================================

SELECT '=== DATABASE SCHEMA OVERVIEW ===' as section;

-- List all tables in public schema
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ==============================================
-- 2. TABLE STRUCTURES AND COLUMNS
-- ==============================================

SELECT '=== TABLE STRUCTURES ===' as section;

-- Get detailed column information for all tables
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default,
    c.character_maximum_length,
    CASE 
        WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY'
        WHEN fk.column_name IS NOT NULL THEN 'FOREIGN KEY'
        ELSE ''
    END as key_type
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
LEFT JOIN (
    SELECT ku.table_name, ku.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY'
) pk ON t.table_name = pk.table_name AND c.column_name = pk.column_name
LEFT JOIN (
    SELECT ku.table_name, ku.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
) fk ON t.table_name = fk.table_name AND c.column_name = fk.column_name
WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;

-- ==============================================
-- 3. FOREIGN KEY RELATIONSHIPS
-- ==============================================

SELECT '=== FOREIGN KEY RELATIONSHIPS ===' as section;

SELECT
    tc.table_name as source_table,
    kcu.column_name as source_column,
    ccu.table_name AS target_table,
    ccu.column_name AS target_column,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ==============================================
-- 4. ROW LEVEL SECURITY STATUS
-- ==============================================

SELECT '=== ROW LEVEL SECURITY STATUS ===' as section;

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ==============================================
-- 5. CURRENT RLS POLICIES
-- ==============================================

SELECT '=== CURRENT RLS POLICIES ===' as section;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ==============================================
-- 6. INDEXES AND PERFORMANCE
-- ==============================================

SELECT '=== INDEXES ===' as section;

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ==============================================
-- 7. DATA COUNTS AND SAMPLE DATA
-- ==============================================

SELECT '=== DATA COUNTS ===' as section;

-- Count records in each table (only for existing tables)
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM public.profiles
UNION ALL
SELECT 'cafes', COUNT(*) FROM public.cafes
UNION ALL
SELECT 'menu_items', COUNT(*) FROM public.menu_items
UNION ALL
SELECT 'orders', COUNT(*) FROM public.orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM public.order_items
UNION ALL
SELECT 'cafe_staff', COUNT(*) FROM public.cafe_staff
UNION ALL
SELECT 'order_notifications', COUNT(*) FROM public.order_notifications
ORDER BY table_name;

-- ==============================================
-- 8. SAMPLE DATA ANALYSIS
-- ==============================================

SELECT '=== SAMPLE DATA ANALYSIS ===' as section;

-- Sample profiles data
SELECT 'Sample Profiles:' as info;
SELECT id, email, full_name, user_type, block, created_at 
FROM public.profiles 
LIMIT 5;

-- Sample cafes data
SELECT 'Sample Cafes:' as info;
SELECT id, name, location, accepting_orders, priority 
FROM public.cafes 
LIMIT 5;

-- Sample orders data
SELECT 'Sample Orders:' as info;
SELECT id, order_number, status, total_amount, user_id, cafe_id, created_at 
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 5;

-- Sample order_items data
SELECT 'Sample Order Items:' as info;
SELECT oi.id, oi.order_id, oi.menu_item_id, oi.quantity, oi.unit_price, mi.name as item_name
FROM public.order_items oi
LEFT JOIN public.menu_items mi ON oi.menu_item_id = mi.id
LIMIT 5;

-- ==============================================
-- 9. CAFE STAFF RELATIONSHIPS
-- ==============================================

SELECT '=== CAFE STAFF RELATIONSHIPS ===' as section;

SELECT 
    cs.id as staff_id,
    cs.cafe_id,
    cs.user_id,
    cs.role,
    cs.is_active,
    p.email,
    p.full_name,
    p.user_type,
    c.name as cafe_name
FROM public.cafe_staff cs
LEFT JOIN public.profiles p ON cs.user_id = p.id
LEFT JOIN public.cafes c ON cs.cafe_id = c.id
ORDER BY c.name, p.full_name;

-- ==============================================
-- 10. AUTHENTICATION AND USER TYPES
-- ==============================================

SELECT '=== USER TYPES DISTRIBUTION ===' as section;

SELECT 
    user_type,
    COUNT(*) as count,
    COUNT(CASE WHEN block IS NOT NULL THEN 1 END) as with_block,
    COUNT(CASE WHEN cafe_id IS NOT NULL THEN 1 END) as with_cafe_id
FROM public.profiles 
GROUP BY user_type
ORDER BY count DESC;

-- ==============================================
-- 11. ORDER SYSTEM ANALYSIS
-- ==============================================

SELECT '=== ORDER SYSTEM ANALYSIS ===' as section;

-- Orders by status
SELECT 
    status,
    COUNT(*) as order_count,
    AVG(total_amount) as avg_amount,
    MIN(created_at) as earliest_order,
    MAX(created_at) as latest_order
FROM public.orders 
GROUP BY status
ORDER BY order_count DESC;

-- Orders with missing data
SELECT 'Orders with missing user data:' as issue;
SELECT COUNT(*) as count
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.id
WHERE p.id IS NULL;

SELECT 'Orders with missing cafe data:' as issue;
SELECT COUNT(*) as count
FROM public.orders o
LEFT JOIN public.cafes c ON o.cafe_id = c.id
WHERE c.id IS NULL;

-- ==============================================
-- 12. POTENTIAL ISSUES IDENTIFICATION
-- ==============================================

SELECT '=== POTENTIAL ISSUES IDENTIFICATION ===' as section;

-- Check for orphaned records
SELECT 'Orphaned order_items (no parent order):' as issue;
SELECT COUNT(*) as count
FROM public.order_items oi
LEFT JOIN public.orders o ON oi.order_id = o.id
WHERE o.id IS NULL;

SELECT 'Orphaned order_items (no menu_item):' as issue;
SELECT COUNT(*) as count
FROM public.order_items oi
LEFT JOIN public.menu_items mi ON oi.menu_item_id = mi.id
WHERE mi.id IS NULL;

-- Check for duplicate policies
SELECT 'Duplicate policy names:' as issue;
SELECT policyname, COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY policyname
HAVING COUNT(*) > 1;

-- Check for conflicting RLS settings
SELECT 'Tables with RLS enabled but no policies:' as issue;
SELECT t.tablename
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public' 
    AND t.rowsecurity = true 
    AND p.tablename IS NULL;

-- ==============================================
-- 13. RECOMMENDATIONS
-- ==============================================

SELECT '=== RECOMMENDATIONS ===' as section;

SELECT 'Based on this analysis, here are the key findings:' as info;

-- Summary of findings
SELECT 
    'Total Tables' as metric, 
    COUNT(*) as value 
FROM pg_tables 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'Tables with RLS Enabled', 
    COUNT(*) 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true

UNION ALL

SELECT 
    'Total RLS Policies', 
    COUNT(*) 
FROM pg_policies 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'Total Foreign Keys', 
    COUNT(*) 
FROM information_schema.table_constraints 
WHERE table_schema = 'public' AND constraint_type = 'FOREIGN KEY';
