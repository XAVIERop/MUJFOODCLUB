-- Fix Duplicate Cafe IDs Issue
-- This script carefully separates Punjabi Tadka and Chatkara cafes
-- Run this in Supabase Dashboard → SQL Editor

-- Step 1: First, let's see the current state
SELECT 
  'CURRENT CAFE STATE:' as section,
  id,
  name,
  type,
  location,
  is_active,
  created_at
FROM public.cafes 
WHERE name ILIKE '%punjabi%' OR name ILIKE '%chatkara%' OR name ILIKE '%tadka%'
ORDER BY name;

-- Step 2: Check if there are duplicate IDs
SELECT 
  'DUPLICATE ID CHECK:' as section,
  id,
  COUNT(*) as count,
  STRING_AGG(name, ', ') as cafe_names
FROM public.cafes 
WHERE name ILIKE '%punjabi%' OR name ILIKE '%chatkara%' OR name ILIKE '%tadka%'
GROUP BY id
HAVING COUNT(*) > 1;

-- Step 3: Check what orders are assigned to the conflicting ID
SELECT 
  'ORDERS WITH CONFLICTING ID:' as section,
  o.order_number,
  o.status,
  o.total_amount,
  o.created_at,
  c.name as cafe_name
FROM public.orders o
LEFT JOIN public.cafes c ON o.cafe_id = c.id
WHERE o.cafe_id = '25d0b247-0731-4e52-a0fb-023526adfa34'
ORDER BY o.created_at DESC;

-- Step 4: Check profiles linked to the conflicting ID
SELECT 
  'PROFILES LINKED TO CONFLICTING ID:' as section,
  p.email,
  p.full_name,
  p.user_type,
  p.cafe_id,
  c.name as cafe_name
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
WHERE p.cafe_id = '25d0b247-0731-4e52-a0fb-023526adfa34';

-- Step 5: Check cafe_staff entries for the conflicting ID
SELECT 
  'CAFE STAFF WITH CONFLICTING ID:' as section,
  cs.user_id,
  cs.cafe_id,
  cs.role,
  cs.is_active,
  p.full_name,
  p.email,
  c.name as cafe_name
FROM public.cafe_staff cs
JOIN public.profiles p ON cs.user_id = p.id
LEFT JOIN public.cafes c ON cs.cafe_id = c.id
WHERE cs.cafe_id = '25d0b247-0731-4e52-a0fb-023526adfa34';

-- Step 6: Now let's fix this step by step
-- First, let's see if Punjabi Tadka cafe exists with a different ID
SELECT 
  'SEARCHING FOR PUNJABI TADKA CAFE:' as section,
  id,
  name,
  type,
  location,
  is_active
FROM public.cafes 
WHERE name ILIKE '%punjabi%tadka%' OR name = 'Punjabi Tadka';

-- Step 7: If Punjabi Tadka doesn't exist or has wrong ID, we need to create/fix it
-- Let's check if we need to create a new Punjabi Tadka cafe
DO $$
DECLARE
    punjabi_tadka_exists BOOLEAN;
    punjabi_tadka_id UUID;
    chatkara_id UUID;
BEGIN
    -- Check if Punjabi Tadka exists
    SELECT EXISTS(
        SELECT 1 FROM public.cafes 
        WHERE name ILIKE '%punjabi%tadka%' OR name = 'Punjabi Tadka'
    ) INTO punjabi_tadka_exists;
    
    -- Get Chatkara ID
    SELECT id INTO chatkara_id FROM public.cafes 
    WHERE name ILIKE '%chatkara%' OR name = 'CHATKARA' 
    LIMIT 1;
    
    IF NOT punjabi_tadka_exists THEN
        -- Create Punjabi Tadka cafe with unique ID
        INSERT INTO public.cafes (
            id,
            name,
            type,
            description,
            location,
            phone,
            hours,
            accepting_orders,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            'Punjabi Tadka',
            'North Indian',
            'Authentic Punjabi cuisine with a modern twist. From crispy starters to rich curries, tandoori specialties to wholesome combos - we bring you the authentic taste of Punjab.',
            'G1 Ground Floor',
            '+91-9001282566',
            '11:00 AM - 2:00 AM',
            true,
            true,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created new Punjabi Tadka cafe';
    END IF;
    
    -- Get Punjabi Tadka ID
    SELECT id INTO punjabi_tadka_id FROM public.cafes 
    WHERE name ILIKE '%punjabi%tadka%' OR name = 'Punjabi Tadka'
    LIMIT 1;
    
    RAISE NOTICE 'Punjabi Tadka ID: %', punjabi_tadka_id;
    RAISE NOTICE 'Chatkara ID: %', chatkara_id;
    
    -- Update Punjabi Tadka owner profile to use correct cafe ID
    UPDATE public.profiles 
    SET 
        cafe_id = punjabi_tadka_id,
        updated_at = NOW()
    WHERE email = 'punjabitadka.owner@mujfoodclub.in';
    
    -- Update cafe_staff entry for Punjabi Tadka owner
    UPDATE public.cafe_staff 
    SET 
        cafe_id = punjabi_tadka_id,
        updated_at = NOW()
    WHERE user_id = (
        SELECT id FROM public.profiles 
        WHERE email = 'punjabitadka.owner@mujfoodclub.in'
    );
    
    RAISE NOTICE 'Updated Punjabi Tadka owner profile and staff entry';
END $$;

-- Step 8: Verify the fix
SELECT 
  'AFTER FIX - PUNJABI TADKA OWNER:' as section,
  p.email,
  p.full_name,
  p.user_type,
  p.cafe_id,
  c.name as cafe_name,
  c.id as actual_cafe_id
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
WHERE p.email = 'punjabitadka.owner@mujfoodclub.in';

-- Step 9: Verify Chatkara is still intact
SELECT 
  'CHATKARA STATUS:' as section,
  p.email,
  p.full_name,
  p.user_type,
  p.cafe_id,
  c.name as cafe_name,
  c.id as actual_cafe_id
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
WHERE p.email = 'chatkara.owner@mujfoodclub.in';

-- Step 10: Check if PUN000003 order needs to be reassigned
SELECT 
  'PUN000003 ORDER STATUS:' as section,
  o.order_number,
  o.cafe_id,
  c.name as current_cafe_name,
  CASE 
    WHEN c.name ILIKE '%punjabi%' THEN '✅ Correctly assigned'
    ELSE '❌ Needs reassignment'
  END as assignment_status
FROM public.orders o
LEFT JOIN public.cafes c ON o.cafe_id = c.id
WHERE o.order_number = 'PUN000003';

-- Step 11: If PUN000003 is assigned to wrong cafe, fix it
UPDATE public.orders 
SET 
    cafe_id = (
        SELECT id FROM public.cafes 
        WHERE name ILIKE '%punjabi%tadka%' OR name = 'Punjabi Tadka'
        LIMIT 1
    ),
    updated_at = NOW()
WHERE order_number = 'PUN000003'
AND cafe_id != (
    SELECT id FROM public.cafes 
    WHERE name ILIKE '%punjabi%tadka%' OR name = 'Punjabi Tadka'
    LIMIT 1
);

-- Step 12: Final verification
SELECT 
  'FINAL VERIFICATION:' as section,
  'Punjabi Tadka and Chatkara should now have different cafe IDs' as check_1,
  'PUN000003 order should be assigned to Punjabi Tadka' as check_2,
  'Both cafe owners should see only their own orders' as check_3;
