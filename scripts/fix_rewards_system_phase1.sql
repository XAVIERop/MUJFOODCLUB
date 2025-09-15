-- =====================================================
-- PHASE 1: Fix Current Rewards System
-- =====================================================
-- This script disables conflicting triggers and fixes Maahi's data

-- 1. Disable the conflicting cafe loyalty trigger
DROP TRIGGER IF EXISTS cafe_loyalty_order_completion_trigger ON public.orders;

-- 2. Disable the old profile trigger that conflicts
DROP TRIGGER IF EXISTS order_status_update_trigger ON public.orders;

-- 3. Fix Maahi's cafe loyalty points to match her profile
UPDATE public.cafe_loyalty_points 
SET 
  points = 125,  -- Match profile points
  total_spent = 1325.00,  -- Match profile total spent
  loyalty_level = 1,  -- Keep as foodie for now
  updated_at = NOW()
WHERE user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d' 
  AND cafe_id = '25d0b247-0731-4e52-a0fb-023526adfa34';

-- 4. Verify the fix
SELECT 
  '=== VERIFICATION - MAHI DATA FIXED ===' as section,
  'Profile Points' as source,
  p.loyalty_points as points,
  p.total_spent as total_spent
FROM public.profiles p
WHERE p.email = 'maahi.229301245@muj.manipal.edu'

UNION ALL

SELECT 
  'Cafe Loyalty Points' as source,
  clp.points::text as points,
  clp.total_spent::text as total_spent
FROM public.cafe_loyalty_points clp
LEFT JOIN public.profiles p ON clp.user_id = p.id
WHERE p.email = 'maahi.229301245@muj.manipal.edu';

-- 5. Check if triggers are disabled
SELECT 
  '=== TRIGGER STATUS ===' as section,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'orders' 
  AND trigger_name IN (
    'cafe_loyalty_order_completion_trigger',
    'order_status_update_trigger'
  );
