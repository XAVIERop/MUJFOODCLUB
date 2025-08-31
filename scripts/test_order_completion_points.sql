-- Test script for Order Completion Points System
-- This script helps verify that points are awarded when orders are completed

-- 1. Check if the trigger function exists
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'award_points_on_order_completion';

-- 2. Check if the trigger is active
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_award_points_on_order_completion';

-- 3. Check recent orders and their points_earned
SELECT 
    o.id,
    o.order_number,
    o.user_id,
    o.total_amount,
    o.points_earned,
    o.status,
    o.created_at,
    p.email,
    p.loyalty_points
FROM public.orders o
JOIN public.profiles p ON o.user_id = p.id
WHERE o.points_earned > 0
ORDER BY o.created_at DESC
LIMIT 10;

-- 4. Check recent loyalty transactions
SELECT 
    lt.user_id,
    p.email,
    lt.order_id,
    lt.points_change,
    lt.transaction_type,
    lt.description,
    lt.created_at,
    o.order_number,
    o.status
FROM public.loyalty_transactions lt
JOIN public.profiles p ON lt.user_id = p.id
LEFT JOIN public.orders o ON lt.order_id = o.id
ORDER BY lt.created_at DESC
LIMIT 10;

-- 5. Test: Update an order status to 'completed' to trigger points
-- (Uncomment and modify the order ID as needed)
/*
UPDATE public.orders 
SET status = 'completed' 
WHERE id = 'your-order-id-here' 
AND status != 'completed';
*/
