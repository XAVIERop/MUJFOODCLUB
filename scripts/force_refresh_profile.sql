-- Force Refresh Profile Data for test@muj.manipal.edu
-- Run this in Supabase SQL Editor to force update the profile

-- This query will update the profile's updated_at timestamp
-- which should trigger any frontend listeners to refresh the data

UPDATE profiles 
SET 
    updated_at = NOW()
WHERE email = 'test@muj.manipal.edu';

-- Verify the update
SELECT 
    'PROFILE UPDATED' as status,
    email,
    loyalty_points,
    total_orders,
    total_spent,
    loyalty_tier,
    is_new_user,
    updated_at
FROM profiles 
WHERE email = 'test@muj.manipal.edu';

-- If the above doesn't work, try this more aggressive approach:
-- This will set all values explicitly to ensure they're correct

UPDATE profiles 
SET 
    loyalty_points = 0,
    total_orders = 0,
    total_spent = 0,
    loyalty_tier = 'foodie',
    is_new_user = true,
    new_user_orders_count = 0,
    updated_at = NOW()
WHERE email = 'test@muj.manipal.edu';

-- Verify the final state
SELECT 
    'FINAL PROFILE STATE' as status,
    email,
    loyalty_points,
    total_orders,
    total_spent,
    loyalty_tier,
    is_new_user,
    new_user_orders_count,
    updated_at
FROM profiles 
WHERE email = 'test@muj.manipal.edu';
