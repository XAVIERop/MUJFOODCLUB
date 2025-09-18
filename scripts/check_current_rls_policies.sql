-- Check current RLS policies for order_items and menu_items
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check all RLS policies on order_items table
SELECT 
    'Order Items RLS Policies' as table_name,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'order_items'
ORDER BY policyname;

-- 2. Check all RLS policies on menu_items table
SELECT 
    'Menu Items RLS Policies' as table_name,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'menu_items'
ORDER BY policyname;

-- 3. Test if the current user can access order_items
SELECT 
    'Current User Access Test' as test,
    auth.uid() as current_user_id,
    p.user_type,
    p.cafe_id
FROM profiles p
WHERE p.id = auth.uid();

-- 4. Test if there are any order_items for recent orders
SELECT 
    'Recent Order Items Test' as test,
    oi.id,
    oi.order_id,
    oi.quantity,
    oi.total_price,
    mi.name as item_name,
    o.order_number
FROM order_items oi
JOIN menu_items mi ON oi.menu_item_id = mi.id
JOIN orders o ON oi.order_id = o.id
ORDER BY o.created_at DESC
LIMIT 5;

-- 5. Test the exact query that Cafe Dashboard uses
SELECT 
    'Cafe Dashboard Query Test' as test,
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
