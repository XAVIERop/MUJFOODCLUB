-- Test Order Items Access for Cafe Owners
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if there are any order_items in the system
SELECT 
    'Order Items Count' as test,
    COUNT(*) as count
FROM order_items;

-- 2. Check recent order_items with details
SELECT 
    'Recent Order Items' as test,
    oi.id,
    oi.order_id,
    oi.quantity,
    oi.total_price,
    mi.name as item_name,
    o.order_number,
    o.cafe_id
FROM order_items oi
JOIN menu_items mi ON oi.menu_item_id = mi.id
JOIN orders o ON oi.order_id = o.id
ORDER BY oi.created_at DESC
LIMIT 5;

-- 3. Test RLS policy for order_items (simulate cafe owner access)
-- This should work if the RLS policy is correct
SELECT 
    'RLS Test for Order Items' as test,
    oi.id,
    oi.order_id,
    oi.quantity,
    oi.total_price,
    mi.name as item_name,
    o.order_number
FROM order_items oi
JOIN menu_items mi ON oi.menu_item_id = mi.id
JOIN orders o ON oi.order_id = o.id
WHERE o.cafe_id = (
    SELECT cafe_id FROM profiles 
    WHERE user_type = 'cafe_owner' 
    LIMIT 1
)
LIMIT 3;

-- 4. Check if the current user can access order_items
SELECT 
    'Current User Access Test' as test,
    auth.uid() as current_user_id,
    p.user_type,
    p.cafe_id
FROM profiles p
WHERE p.id = auth.uid();

-- 5. Test the exact query that POS Dashboard uses
SELECT 
    'POS Dashboard Query Test' as test,
    o.id as order_id,
    o.order_number,
    o.total_amount,
    o.cafe_id,
    oi.id as item_id,
    oi.quantity,
    oi.total_price,
    mi.name as item_name
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
WHERE o.cafe_id = (
    SELECT cafe_id FROM profiles 
    WHERE user_type = 'cafe_owner' 
    LIMIT 1
)
ORDER BY o.created_at DESC
LIMIT 3;

-- 6. Check RLS policies on order_items table
SELECT 
    'Order Items RLS Policies' as test,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'order_items';
