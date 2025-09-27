-- Verify Punjabi Tadka Order Routing
-- This script checks if order #PUN000003 is properly routed to Punjabi Tadka
-- Run this in Supabase Dashboard → SQL Editor

-- Step 1: Find the PUN000003 order
SELECT 
  'Order PUN000003 Details:' as section,
  o.id,
  o.order_number,
  o.status,
  o.total_amount,
  o.cafe_id,
  c.name as cafe_name,
  o.created_at,
  o.updated_at
FROM public.orders o
LEFT JOIN public.cafes c ON o.cafe_id = c.id
WHERE o.order_number = 'PUN000003';

-- Step 2: Check all orders with PUN prefix (Punjabi Tadka orders)
SELECT 
  'All Punjabi Tadka Orders (PUN prefix):' as section,
  o.order_number,
  o.status,
  o.total_amount,
  o.cafe_id,
  c.name as cafe_name,
  o.created_at
FROM public.orders o
LEFT JOIN public.cafes c ON o.cafe_id = c.id
WHERE o.order_number LIKE 'PUN%'
ORDER BY o.created_at DESC;

-- Step 3: Verify Punjabi Tadka cafe ID
SELECT 
  'Punjabi Tadka Cafe ID:' as section,
  id,
  name,
  type,
  location,
  is_active
FROM public.cafes 
WHERE name ILIKE '%punjabi%tadka%' OR name = 'Punjabi Tadka';

-- Step 4: Check if Punjabi Tadka owner can see their orders
-- This simulates what the POS dashboard would query
SELECT 
  'Orders visible to Punjabi Tadka owner:' as section,
  o.id,
  o.order_number,
  o.status,
  o.total_amount,
  o.created_at,
  p.full_name as customer_name
FROM public.orders o
JOIN public.cafes c ON o.cafe_id = c.id
JOIN public.profiles p ON o.user_id = p.id
WHERE c.name ILIKE '%punjabi%tadka%' OR c.name = 'Punjabi Tadka'
ORDER BY o.created_at DESC;

-- Step 5: Check RLS policies for orders table
SELECT 
  'RLS Policies for Orders:' as section,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY policyname;

-- Step 6: Test if Punjabi Tadka owner profile has correct cafe_id
SELECT 
  'Punjabi Tadka Owner Profile:' as section,
  p.id,
  p.email,
  p.full_name,
  p.user_type,
  p.cafe_id,
  c.name as cafe_name,
  CASE 
    WHEN p.cafe_id = c.id THEN '✅ Correctly linked'
    ELSE '❌ Incorrectly linked'
  END as linkage_status
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
WHERE p.email = 'punjabitadka.owner@mujfoodclub.in';

-- Step 7: Check cafe_staff entry for Punjabi Tadka owner
SELECT 
  'Cafe Staff Entry for Punjabi Tadka Owner:' as section,
  cs.user_id,
  cs.cafe_id,
  cs.role,
  cs.is_active,
  p.full_name,
  c.name as cafe_name
FROM public.cafe_staff cs
JOIN public.profiles p ON cs.user_id = p.id
JOIN public.cafes c ON cs.cafe_id = c.id
WHERE p.email = 'punjabitadka.owner@mujfoodclub.in';

-- Step 8: Summary
SELECT 
  'SUMMARY:' as section,
  'Check if PUN000003 order is properly assigned to Punjabi Tadka cafe' as check_1,
  'Verify Punjabi Tadka owner profile has correct cafe_id' as check_2,
  'Ensure RLS policies allow cafe owner to see their orders' as check_3;
