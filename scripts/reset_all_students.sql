-- =====================================================
-- PRODUCTION RESET: Reset All Student Accounts
-- =====================================================
-- This script resets all user data to fresh state for production
-- WARNING: This will delete ALL user data including orders, points, transactions
-- Date: 2025-09-06
-- =====================================================

BEGIN;

-- Step 1: Delete all order items (must be deleted first due to foreign key constraints)
DELETE FROM order_items 
WHERE id != '00000000-0000-0000-0000-000000000000';

-- Step 2: Delete all orders
DELETE FROM orders 
WHERE id != '00000000-0000-0000-0000-000000000000';

-- Step 3: Delete all loyalty transactions
DELETE FROM loyalty_transactions 
WHERE id != '00000000-0000-0000-0000-000000000000';

-- Step 4: Delete all order ratings
DELETE FROM order_ratings 
WHERE id != '00000000-0000-0000-0000-000000000000';

-- Step 5: Delete all user favorites
DELETE FROM user_favorites 
WHERE id != '00000000-0000-0000-0000-000000000000';

-- Step 6: Reset all user profiles to initial state
UPDATE profiles 
SET 
    loyalty_points = 0,
    loyalty_tier = 'foodie',
    total_orders = 0,
    total_spent = 0,
    updated_at = NOW()
WHERE id != '00000000-0000-0000-0000-000000000000';

-- Step 7: Verification queries (run these after the reset to confirm)
-- Uncomment these to check the results:

-- SELECT COUNT(*) as remaining_orders FROM orders WHERE id != '00000000-0000-0000-0000-000000000000';
-- SELECT COUNT(*) as remaining_transactions FROM loyalty_transactions WHERE id != '00000000-0000-0000-0000-000000000000';
-- SELECT COUNT(*) as profiles_with_points FROM profiles WHERE loyalty_points > 0 AND id != '00000000-0000-0000-0000-000000000000';
-- SELECT COUNT(*) as total_profiles_reset FROM profiles WHERE id != '00000000-0000-0000-0000-000000000000';

COMMIT;

-- =====================================================
-- RESET COMPLETED
-- =====================================================
-- All student accounts have been reset to fresh state:
-- • loyalty_points: 0
-- • loyalty_tier: 'foodie' 
-- • total_orders: 0
-- • total_spent: 0
-- • All orders, transactions, ratings, and favorites deleted
-- 
-- Users can still log in with their existing credentials
-- but will start with clean data for production.
-- =====================================================
