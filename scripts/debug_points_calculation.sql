-- Debug points calculation for test user
-- This will help us understand what's happening

-- 1. Check the test user's current profile
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

-- 2. Check recent orders for test user
SELECT 
    order_number,
    total_amount,
    points_earned,
    status,
    created_at
FROM orders 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'test@muj.manipal.edu')
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check recent loyalty transactions
SELECT 
    lt.*,
    o.order_number,
    o.total_amount
FROM loyalty_transactions lt
LEFT JOIN orders o ON lt.order_id = o.id
WHERE lt.user_id = (SELECT id FROM profiles WHERE email = 'test@muj.manipal.edu')
ORDER BY lt.created_at DESC
LIMIT 10;

-- 4. Test the calculate_new_points function manually
SELECT calculate_new_points(
    (SELECT id FROM profiles WHERE email = 'test@muj.manipal.edu'),
    500,
    'foodie'
) as calculated_points;

-- 5. Check what triggers are currently active
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
AND event_object_schema = 'public';
