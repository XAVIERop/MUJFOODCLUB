-- Fix POS Dashboard Cafe Detection
-- This script ensures the POS dashboard correctly detects cafe based on logged-in user
-- Run this in Supabase Dashboard → SQL Editor

-- Step 1: Check all cafe owners and their cafe assignments
SELECT 
  'All Cafe Owners Status:' as section,
  p.email,
  p.full_name,
  p.user_type,
  p.cafe_id,
  c.name as cafe_name,
  c.id as actual_cafe_id,
  CASE 
    WHEN p.cafe_id = c.id THEN '✅ Correctly linked'
    ELSE '❌ Incorrectly linked'
  END as linkage_status
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
WHERE p.user_type = 'cafe_owner'
ORDER BY p.email;

-- Step 2: Check cafe_staff entries for all cafe owners
SELECT 
  'Cafe Staff Entries:' as section,
  cs.user_id,
  cs.cafe_id,
  cs.role,
  cs.is_active,
  p.full_name,
  p.email,
  c.name as cafe_name
FROM public.cafe_staff cs
JOIN public.profiles p ON cs.user_id = p.id
JOIN public.cafes c ON cs.cafe_id = c.id
WHERE p.user_type = 'cafe_owner'
ORDER BY p.email;

-- Step 3: Verify RLS policies allow cafe owners to see their orders
SELECT 
  'RLS Policies for Orders Table:' as section,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY policyname;

-- Step 4: Test order visibility for each cafe owner
-- This simulates what the POS dashboard would see for each cafe owner

-- Punjabi Tadka owner orders
SELECT 
  'Punjabi Tadka Owner Orders:' as section,
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'received' THEN 1 END) as received_orders,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
  COUNT(CASE WHEN status = 'preparing' THEN 1 END) as preparing_orders
FROM public.orders o
JOIN public.cafes c ON o.cafe_id = c.id
WHERE c.name ILIKE '%punjabi%tadka%' OR c.name = 'Punjabi Tadka';

-- Chatkara owner orders
SELECT 
  'Chatkara Owner Orders:' as section,
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'received' THEN 1 END) as received_orders,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
  COUNT(CASE WHEN status = 'preparing' THEN 1 END) as preparing_orders
FROM public.orders o
JOIN public.cafes c ON o.cafe_id = c.id
WHERE c.name ILIKE '%chatkara%' OR c.name = 'CHATKARA';

-- Step 5: Check for any duplicate cafe IDs or naming issues
SELECT 
  'Cafe ID Conflicts Check:' as section,
  id,
  name,
  type,
  location,
  is_active,
  created_at
FROM public.cafes 
WHERE name ILIKE '%punjabi%' OR name ILIKE '%chatkara%'
ORDER BY name;

-- Step 6: Verify order number prefixes match cafe names
SELECT 
  'Order Number Prefix Analysis:' as section,
  SUBSTRING(o.order_number, 1, 3) as prefix,
  COUNT(*) as order_count,
  c.name as cafe_name
FROM public.orders o
JOIN public.cafes c ON o.cafe_id = c.id
WHERE o.order_number ~ '^[A-Z]{3}[0-9]+$'
GROUP BY SUBSTRING(o.order_number, 1, 3), c.name
ORDER BY prefix;

-- Step 7: Final verification - Show what each cafe owner should see
SELECT 
  'FINAL VERIFICATION:' as section,
  'Each cafe owner should only see orders for their own cafe' as note_1,
  'Punjabi Tadka owner should see PUN* orders' as note_2,
  'Chatkara owner should see CHA* orders' as note_3,
  'POS dashboard should use profile.cafe_id, not hardcoded IDs' as note_4;
