-- Check current points calculation system
-- This script will help us understand what's currently running

-- 1. Check if there are any triggers on the orders table
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
AND event_object_schema = 'public';

-- 2. Check the current calculate_new_points function
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'calculate_new_points'
AND routine_schema = 'public';

-- 3. Check the award_points_on_order_completion function
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'award_points_on_order_completion'
AND routine_schema = 'public';

-- 4. Check recent loyalty transactions for test user
SELECT 
    lt.*,
    o.order_number,
    o.total_amount
FROM loyalty_transactions lt
LEFT JOIN orders o ON lt.order_id = o.id
WHERE lt.user_id = (SELECT id FROM profiles WHERE email = 'test@muj.manipal.edu')
ORDER BY lt.created_at DESC
LIMIT 10;

-- 5. Check the test user's current profile
SELECT 
    email,
    loyalty_points,
    total_orders,
    total_spent,
    loyalty_tier,
    is_new_user,
    new_user_orders_count
FROM profiles 
WHERE email = 'test@muj.manipal.edu';
