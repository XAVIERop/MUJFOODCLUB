-- Test script to verify the points system is working correctly
-- This script helps debug points earning and redemption issues

-- 1. Check user's current points and profile
SELECT 
    id,
    email,
    loyalty_points,
    loyalty_tier,
    total_orders,
    total_spent,
    is_new_user,
    new_user_orders_count
FROM public.profiles 
WHERE email LIKE '%@muj.manipal.edu'
ORDER BY loyalty_points DESC
LIMIT 5;

-- 2. Check recent loyalty transactions
SELECT 
    lt.user_id,
    p.email,
    lt.order_id,
    lt.points_change,
    lt.transaction_type,
    lt.description,
    lt.created_at,
    o.order_number,
    c.name as cafe_name
FROM public.loyalty_transactions lt
JOIN public.profiles p ON lt.user_id = p.id
LEFT JOIN public.orders o ON lt.order_id = o.id
LEFT JOIN public.cafes c ON o.cafe_id = c.id
ORDER BY lt.created_at DESC
LIMIT 10;

-- 3. Check recent orders with points earned
SELECT 
    o.id,
    o.order_number,
    o.user_id,
    o.cafe_id,
    o.total_amount,
    o.points_earned,
    o.status,
    o.created_at,
    c.name as cafe_name,
    p.email
FROM public.orders o
JOIN public.cafes c ON o.cafe_id = c.id
JOIN public.profiles p ON o.user_id = p.id
WHERE o.points_earned > 0
ORDER BY o.created_at DESC
LIMIT 10;

-- 4. Check if the enhanced points calculation function exists
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'calculate_enhanced_points';

-- 5. Check if the track_maintenance_spending function exists
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'track_maintenance_spending';

-- 6. Check if the handle_new_user_first_order function exists
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'handle_new_user_first_order';
