-- Complete deletion of maahi.229301245@muj.manipal.edu account
-- This script will delete all related data first, then the user

-- Step 1: Check what data exists for this user
SELECT 'Checking user data...' as step;

SELECT 
    p.id,
    p.email,
    p.full_name,
    p.block,
    p.phone,
    p.user_type,
    p.created_at
FROM profiles p
WHERE p.email = 'maahi.229301245@muj.manipal.edu';

-- Step 2: Check related orders
SELECT 'Checking orders...' as step;

SELECT 
    o.id,
    o.order_number,
    o.status,
    o.total_amount,
    o.created_at
FROM orders o
JOIN profiles p ON o.user_id = p.id
WHERE p.email = 'maahi.229301245@muj.manipal.edu';

-- Step 3: Check order items
SELECT 'Checking order items...' as step;

SELECT 
    oi.id,
    oi.quantity,
    oi.unit_price,
    oi.total_price
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN profiles p ON o.user_id = p.id
WHERE p.email = 'maahi.229301245@muj.manipal.edu';

-- Step 4: Check order ratings
SELECT 'Checking order ratings...' as step;

SELECT 
    or_.id,
    or_.rating,
    or_.review,
    or_.created_at
FROM order_ratings or_
JOIN orders o ON or_.order_id = o.id
JOIN profiles p ON o.user_id = p.id
WHERE p.email = 'maahi.229301245@muj.manipal.edu';

-- Step 5: Delete in correct order (respecting foreign key constraints)

-- Delete order ratings first
DELETE FROM order_ratings 
WHERE order_id IN (
    SELECT o.id 
    FROM orders o
    JOIN profiles p ON o.user_id = p.id
    WHERE p.email = 'maahi.229301245@muj.manipal.edu'
);

-- Delete order items
DELETE FROM order_items 
WHERE order_id IN (
    SELECT o.id 
    FROM orders o
    JOIN profiles p ON o.user_id = p.id
    WHERE p.email = 'maahi.229301245@muj.manipal.edu'
);

-- Delete orders
DELETE FROM orders 
WHERE user_id IN (
    SELECT p.id 
    FROM profiles p
    WHERE p.email = 'maahi.229301245@muj.manipal.edu'
);

-- Delete profile
DELETE FROM profiles 
WHERE email = 'maahi.229301245@muj.manipal.edu';

-- Step 6: Verify deletion
SELECT 'Verification...' as step;

-- Check if profile is deleted
SELECT 
    COUNT(*) as profiles_remaining
FROM profiles 
WHERE email = 'maahi.229301245@muj.manipal.edu';

-- Check if orders are deleted
SELECT 
    COUNT(*) as orders_remaining
FROM orders o
JOIN profiles p ON o.user_id = p.id
WHERE p.email = 'maahi.229301245@muj.manipal.edu';

-- Should return 0 for both if successful
