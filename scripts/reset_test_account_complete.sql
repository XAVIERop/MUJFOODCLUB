-- Complete Reset for test@muj.manipal.edu Account
-- Run this in Supabase SQL Editor to completely reset the test account

-- Step 1: Get the user ID for test@muj.manipal.edu
DO $$
DECLARE
    test_user_id UUID;
    orders_count INTEGER;
    notifications_count INTEGER;
    ratings_count INTEGER;
    transactions_count INTEGER;
    bonuses_count INTEGER;
    maintenance_count INTEGER;
    cafe_staff_count INTEGER;
BEGIN
    -- Get the user ID
    SELECT id INTO test_user_id FROM profiles WHERE email = 'test@muj.manipal.edu';
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE '❌ User test@muj.manipal.edu not found!';
        RETURN;
    END IF;
    
    RAISE NOTICE '✅ Found user: test@muj.manipal.edu (ID: %)', test_user_id;
    
    -- Count existing data
    SELECT COUNT(*) INTO orders_count FROM orders WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO notifications_count FROM order_notifications WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO transactions_count FROM loyalty_transactions WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO bonuses_count FROM user_bonuses WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO maintenance_count FROM maintenance_periods WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO cafe_staff_count FROM cafe_staff WHERE user_id = test_user_id;
    
    -- Count order ratings (need to join with orders)
    SELECT COUNT(*) INTO ratings_count 
    FROM order_ratings ord_rat 
    JOIN orders o ON ord_rat.order_id = o.id 
    WHERE o.user_id = test_user_id;
    
    RAISE NOTICE '📊 Current data for test account:';
    RAISE NOTICE '   - Orders: %', orders_count;
    RAISE NOTICE '   - Notifications: %', notifications_count;
    RAISE NOTICE '   - Loyalty Transactions: %', transactions_count;
    RAISE NOTICE '   - User Bonuses: %', bonuses_count;
    RAISE NOTICE '   - Maintenance Periods: %', maintenance_count;
    RAISE NOTICE '   - Cafe Staff Records: %', cafe_staff_count;
    RAISE NOTICE '   - Order Ratings: %', ratings_count;
    
    -- Step 2: Delete all related data
    
    -- Delete order ratings first (they reference orders)
    DELETE FROM order_ratings 
    WHERE order_id IN (
        SELECT id FROM orders WHERE user_id = test_user_id
    );
    RAISE NOTICE '🗑️ Deleted order ratings';
    
    -- Delete order notifications
    DELETE FROM order_notifications WHERE user_id = test_user_id;
    RAISE NOTICE '🗑️ Deleted order notifications';
    
    -- Delete orders
    DELETE FROM orders WHERE user_id = test_user_id;
    RAISE NOTICE '🗑️ Deleted orders';
    
    -- Delete loyalty transactions
    DELETE FROM loyalty_transactions WHERE user_id = test_user_id;
    RAISE NOTICE '🗑️ Deleted loyalty transactions';
    
    -- Delete user bonuses
    DELETE FROM user_bonuses WHERE user_id = test_user_id;
    RAISE NOTICE '🗑️ Deleted user bonuses';
    
    -- Delete maintenance periods
    DELETE FROM maintenance_periods WHERE user_id = test_user_id;
    RAISE NOTICE '🗑️ Deleted maintenance periods';
    
    -- Delete cafe staff records
    DELETE FROM cafe_staff WHERE user_id = test_user_id;
    RAISE NOTICE '🗑️ Deleted cafe staff records';
    
    -- Step 3: Reset profile to initial state
    UPDATE profiles 
    SET 
        loyalty_points = 0,
        total_orders = 0,
        total_spent = 0,
        loyalty_tier = 'foodie',
        is_new_user = true,
        new_user_orders_count = 0,
        updated_at = NOW()
    WHERE id = test_user_id;
    RAISE NOTICE '🔄 Reset profile to initial state';
    
    -- Step 4: Verify cleanup
    SELECT COUNT(*) INTO orders_count FROM orders WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO notifications_count FROM order_notifications WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO transactions_count FROM loyalty_transactions WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO bonuses_count FROM user_bonuses WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO maintenance_count FROM maintenance_periods WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO cafe_staff_count FROM cafe_staff WHERE user_id = test_user_id;
    
    SELECT COUNT(*) INTO ratings_count 
    FROM order_ratings ord_rat 
    JOIN orders o ON ord_rat.order_id = o.id 
    WHERE o.user_id = test_user_id;
    
    RAISE NOTICE '✅ Verification - Remaining data:';
    RAISE NOTICE '   - Orders: %', orders_count;
    RAISE NOTICE '   - Notifications: %', notifications_count;
    RAISE NOTICE '   - Loyalty Transactions: %', transactions_count;
    RAISE NOTICE '   - User Bonuses: %', bonuses_count;
    RAISE NOTICE '   - Maintenance Periods: %', maintenance_count;
    RAISE NOTICE '   - Cafe Staff Records: %', cafe_staff_count;
    RAISE NOTICE '   - Order Ratings: %', ratings_count;
    
    -- Step 5: Show final profile state
    RAISE NOTICE '📋 Final profile state:';
    RAISE NOTICE '   - Email: test@muj.manipal.edu';
    RAISE NOTICE '   - Loyalty Points: 0';
    RAISE NOTICE '   - Total Orders: 0';
    RAISE NOTICE '   - Total Spent: 0';
    RAISE NOTICE '   - Loyalty Tier: foodie';
    RAISE NOTICE '   - Is New User: true';
    
    RAISE NOTICE '🎉 Test account reset completed successfully!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error during reset: %', SQLERRM;
        RAISE;
END $$;

-- Optional: Show the current profile state after reset
SELECT 
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
