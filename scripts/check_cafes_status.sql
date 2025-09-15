-- =====================================================
-- Check Cafes Status After Simplification
-- =====================================================

-- 1. Check total cafes count
SELECT 
    '=== TOTAL CAFES COUNT ===' as section,
    COUNT(*) as total_cafes
FROM public.cafes;

-- 2. Check cafes with accepting_orders = true
SELECT 
    '=== CAFES ACCEPTING ORDERS ===' as section,
    COUNT(*) as accepting_orders_count
FROM public.cafes 
WHERE accepting_orders = true;

-- 3. List all cafes with their status
SELECT 
    '=== ALL CAFES STATUS ===' as section,
    id,
    name,
    accepting_orders,
    whatsapp_phone,
    whatsapp_enabled
FROM public.cafes 
ORDER BY name;

-- 4. Check if there are any issues with the cafes table
SELECT 
    '=== CAFES TABLE STRUCTURE ===' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cafes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check for any recent changes or issues
SELECT 
    '=== CAFES DATA CHECK ===' as section,
    'Checking for data integrity issues' as status;
