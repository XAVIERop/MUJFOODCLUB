-- Simple test to check order completion without points trigger
-- Run this step by step to identify the issue

-- 1. First, check if we can update an order status at all
-- Find a recent order that's not completed
SELECT 
    id,
    order_number,
    status,
    points_earned
FROM public.orders 
WHERE status != 'completed' 
ORDER BY created_at DESC 
LIMIT 3;

-- 2. Try to manually update an order status (replace ORDER_ID with actual ID)
-- This will help identify if the issue is with the basic update or the trigger
/*
UPDATE public.orders 
SET status = 'completed' 
WHERE id = 'ORDER_ID_HERE';
*/

-- 3. Check if the trigger function exists and is valid
SELECT 
    proname as function_name,
    prorettype::regtype as return_type
FROM pg_proc 
WHERE proname = 'award_points_on_order_completion';

-- 4. Check if the trigger is active
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_award_points_on_order_completion';

-- 5. Check if required tables and columns exist
SELECT 
    'orders' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('status', 'points_earned', 'user_id')
UNION ALL
SELECT 
    'profiles' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('loyalty_points', 'total_orders', 'total_spent')
UNION ALL
SELECT 
    'loyalty_transactions' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'loyalty_transactions' 
AND column_name IN ('user_id', 'order_id', 'points_change', 'transaction_type');
