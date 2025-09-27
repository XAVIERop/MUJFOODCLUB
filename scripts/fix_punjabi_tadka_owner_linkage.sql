-- Fix Punjabi Tadka Owner Account Linkage
-- This script ensures Punjabi Tadka owner is properly linked to their cafe
-- Run this in Supabase Dashboard → SQL Editor

-- Step 1: Check current status
SELECT 
  'BEFORE FIX - Punjabi Tadka Owner Status:' as section,
  p.id,
  p.email,
  p.full_name,
  p.user_type,
  p.cafe_id,
  c.name as cafe_name,
  c.id as actual_cafe_id
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
WHERE p.email = 'punjabitadka.owner@mujfoodclub.in';

-- Step 2: Check if Punjabi Tadka cafe exists and get its ID
SELECT 
  'Punjabi Tadka Cafe Info:' as section,
  id,
  name,
  type,
  location,
  is_active,
  created_at
FROM public.cafes 
WHERE name ILIKE '%punjabi%tadka%' OR name = 'Punjabi Tadka';

-- Step 3: Fix the Punjabi Tadka owner profile
-- Update the cafe_id to point to the correct Punjabi Tadka cafe
UPDATE public.profiles 
SET 
  cafe_id = (
    SELECT id 
    FROM public.cafes 
    WHERE name ILIKE '%punjabi%tadka%' OR name = 'Punjabi Tadka'
    LIMIT 1
  ),
  user_type = 'cafe_owner',
  updated_at = NOW()
WHERE email = 'punjabitadka.owner@mujfoodclub.in';

-- Step 4: Create or update cafe_staff entry for Punjabi Tadka owner
INSERT INTO public.cafe_staff (
  user_id,
  cafe_id,
  role,
  is_active,
  created_at,
  updated_at
)
SELECT 
  p.id,
  p.cafe_id,
  'owner',
  true,
  NOW(),
  NOW()
FROM public.profiles p
WHERE p.email = 'punjabitadka.owner@mujfoodclub.in'
ON CONFLICT (user_id, cafe_id) 
DO UPDATE SET
  role = 'owner',
  is_active = true,
  updated_at = NOW();

-- Step 5: Verify the fix
SELECT 
  'AFTER FIX - Punjabi Tadka Owner Status:' as section,
  p.id,
  p.email,
  p.full_name,
  p.user_type,
  p.cafe_id,
  c.name as cafe_name,
  c.location as cafe_location,
  c.is_active as cafe_active
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
WHERE p.email = 'punjabitadka.owner@mujfoodclub.in';

-- Step 6: Verify cafe_staff entry
SELECT 
  'Cafe Staff Entry:' as section,
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

-- Step 7: Check if there are any orders for Punjabi Tadka
SELECT 
  'Punjabi Tadka Orders:' as section,
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'received' THEN 1 END) as received_orders,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
  COUNT(CASE WHEN status = 'preparing' THEN 1 END) as preparing_orders
FROM public.orders o
JOIN public.cafes c ON o.cafe_id = c.id
WHERE c.name ILIKE '%punjabi%tadka%' OR c.name = 'Punjabi Tadka';

-- Step 8: Show recent orders for Punjabi Tadka
SELECT 
  'Recent Punjabi Tadka Orders:' as section,
  o.order_number,
  o.status,
  o.total_amount,
  o.created_at,
  p.full_name as customer_name
FROM public.orders o
JOIN public.cafes c ON o.cafe_id = c.id
JOIN public.profiles p ON o.user_id = p.id
WHERE c.name ILIKE '%punjabi%tadka%' OR c.name = 'Punjabi Tadka'
ORDER BY o.created_at DESC
LIMIT 5;

-- Step 9: Final verification
SELECT 
  'FIX COMPLETE' as status,
  'Punjabi Tadka owner is now properly linked to their cafe' as result;
