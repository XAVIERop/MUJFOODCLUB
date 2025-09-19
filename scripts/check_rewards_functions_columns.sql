-- Check for rewards-related functions and columns that might still exist

-- 1. Check for rewards-related functions
SELECT 
    'REWARDS FUNCTIONS' as category,
    routine_name as function_name,
    routine_type,
    'Will be dropped' as action
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND (
    routine_name LIKE '%loyalty%' OR
    routine_name LIKE '%rewards%' OR
    routine_name LIKE '%points%' OR
    routine_name LIKE '%tier%' OR
    routine_name LIKE '%bonus%'
);

-- 2. Check for rewards-related columns in profiles table
SELECT 
    'PROFILES COLUMNS' as category,
    column_name,
    data_type,
    is_nullable,
    'Will be dropped' as action
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND (
    column_name LIKE '%loyalty%' OR
    column_name LIKE '%rewards%' OR
    column_name LIKE '%points%' OR
    column_name LIKE '%tier%' OR
    column_name LIKE '%bonus%' OR
    column_name LIKE '%maintenance%'
);

-- 3. Check for rewards-related columns in orders table
SELECT 
    'ORDERS COLUMNS' as category,
    column_name,
    data_type,
    is_nullable,
    'Will be kept (set to 0)' as action
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
AND (
    column_name LIKE '%points%' OR
    column_name LIKE '%loyalty%' OR
    column_name LIKE '%rewards%'
);

-- 4. Check for rewards-related enums
SELECT 
    'REWARDS ENUMS' as category,
    typname as enum_name,
    'Will be dropped' as action
FROM pg_type 
WHERE typname LIKE '%loyalty%' OR typname LIKE '%tier%';

-- 5. Check for any rewards-related triggers
SELECT 
    'REWARDS TRIGGERS' as category,
    trigger_name,
    event_manipulation,
    'Will be dropped' as action
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND (
    trigger_name LIKE '%loyalty%' OR
    trigger_name LIKE '%rewards%' OR
    trigger_name LIKE '%points%'
);

-- 6. Check for any rewards-related views
SELECT 
    'REWARDS VIEWS' as category,
    table_name as view_name,
    'Will be dropped' as action
FROM information_schema.views 
WHERE table_schema = 'public'
AND (
    table_name LIKE '%loyalty%' OR
    table_name LIKE '%rewards%' OR
    table_name LIKE '%points%'
);
