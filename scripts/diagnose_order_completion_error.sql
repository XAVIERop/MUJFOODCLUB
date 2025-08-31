-- Diagnostic script to check what's causing the order completion error
-- Run this to identify the issue

-- 1. Check if the orders table has all required columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('points_earned', 'status', 'user_id', 'total_amount', 'order_number')
ORDER BY column_name;

-- 2. Check if the profiles table has all required columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('loyalty_points', 'total_orders', 'total_spent')
ORDER BY column_name;

-- 3. Check if the loyalty_transactions table exists and has correct structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'loyalty_transactions'
ORDER BY column_name;

-- 4. Check if the trigger function exists and is valid
SELECT 
    proname as function_name,
    prosrc as function_source,
    prorettype::regtype as return_type
FROM pg_proc 
WHERE proname = 'award_points_on_order_completion';

-- 5. Check if the trigger is active
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing,
    action_orientation
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_award_points_on_order_completion';

-- 6. Check recent orders to see their current state
SELECT 
    id,
    order_number,
    status,
    points_earned,
    user_id,
    total_amount,
    created_at
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 5;

-- 7. Check current database activity (this will show active queries)
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query
FROM pg_stat_activity 
WHERE state = 'active' 
AND query NOT LIKE '%pg_stat_activity%'
ORDER BY query_start DESC 
LIMIT 10;
