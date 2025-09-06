-- Check Profile Data After Reset for test@muj.manipal.edu
-- Run this in Supabase SQL Editor to verify the reset worked

-- Step 1: Check if the user exists and get their profile data
SELECT 
    'PROFILE DATA' as section,
    email,
    full_name,
    loyalty_points,
    total_orders,
    total_spent,
    loyalty_tier,
    is_new_user,
    new_user_orders_count,
    updated_at
FROM profiles 
WHERE email = 'test@muj.manipal.edu';

-- Step 2: Check if there are any remaining orders
SELECT 
    'REMAINING ORDERS' as section,
    COUNT(*) as order_count,
    SUM(total_amount) as total_amount_sum
FROM orders 
WHERE user_id = (
    SELECT id FROM profiles WHERE email = 'test@muj.manipal.edu'
);

-- Step 3: Check if there are any remaining loyalty transactions
SELECT 
    'REMAINING LOYALTY TRANSACTIONS' as section,
    COUNT(*) as transaction_count,
    SUM(points) as total_points
FROM loyalty_transactions 
WHERE user_id = (
    SELECT id FROM profiles WHERE email = 'test@muj.manipal.edu'
);

-- Step 4: Check if there are any remaining order ratings
SELECT 
    'REMAINING ORDER RATINGS' as section,
    COUNT(*) as rating_count
FROM order_ratings ord_rat
JOIN orders o ON ord_rat.order_id = o.id
WHERE o.user_id = (
    SELECT id FROM profiles WHERE email = 'test@muj.manipal.edu'
);

-- Step 5: Check if there are any remaining notifications
SELECT 
    'REMAINING NOTIFICATIONS' as section,
    COUNT(*) as notification_count
FROM order_notifications 
WHERE user_id = (
    SELECT id FROM profiles WHERE email = 'test@muj.manipal.edu'
);

-- Step 6: Check if there are any remaining user bonuses
SELECT 
    'REMAINING USER BONUSES' as section,
    COUNT(*) as bonus_count,
    SUM(points_awarded) as total_bonus_points
FROM user_bonuses 
WHERE user_id = (
    SELECT id FROM profiles WHERE email = 'test@muj.manipal.edu'
);

-- Step 7: Check if there are any remaining maintenance periods
SELECT 
    'REMAINING MAINTENANCE PERIODS' as section,
    COUNT(*) as maintenance_count
FROM maintenance_periods 
WHERE user_id = (
    SELECT id FROM profiles WHERE email = 'test@muj.manipal.edu'
);

-- Step 8: Summary - Everything should be 0 or empty
SELECT 
    'SUMMARY' as section,
    CASE 
        WHEN (SELECT COUNT(*) FROM orders WHERE user_id = (SELECT id FROM profiles WHERE email = 'test@muj.manipal.edu')) = 0 
        AND (SELECT COUNT(*) FROM loyalty_transactions WHERE user_id = (SELECT id FROM profiles WHERE email = 'test@muj.manipal.edu')) = 0
        AND (SELECT COUNT(*) FROM order_notifications WHERE user_id = (SELECT id FROM profiles WHERE email = 'test@muj.manipal.edu')) = 0
        AND (SELECT COUNT(*) FROM user_bonuses WHERE user_id = (SELECT id FROM profiles WHERE email = 'test@muj.manipal.edu')) = 0
        AND (SELECT COUNT(*) FROM maintenance_periods WHERE user_id = (SELECT id FROM profiles WHERE email = 'test@muj.manipal.edu')) = 0
        AND (SELECT loyalty_points FROM profiles WHERE email = 'test@muj.manipal.edu') = 0
        AND (SELECT total_orders FROM profiles WHERE email = 'test@muj.manipal.edu') = 0
        AND (SELECT total_spent FROM profiles WHERE email = 'test@muj.manipal.edu') = 0
        THEN '✅ RESET SUCCESSFUL - All data cleared!'
        ELSE '❌ RESET INCOMPLETE - Some data still exists'
    END as reset_status;
