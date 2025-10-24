-- Manual Cafe Reopening Script
-- Run this in Supabase Dashboard → SQL Editor

-- Check current status
SELECT 'BEFORE REOPENING:' as status;
SELECT 
  name,
  accepting_orders,
  updated_at
FROM public.cafes 
ORDER BY name;

-- Manually reopen all cafes
UPDATE public.cafes 
SET 
  accepting_orders = true,
  updated_at = NOW()
WHERE accepting_orders = false;

-- Check status after reopening
SELECT 'AFTER REOPENING:' as status;
SELECT 
  name,
  accepting_orders,
  updated_at
FROM public.cafes 
ORDER BY name;

-- Show summary
SELECT 
  'SUMMARY:' as info,
  COUNT(*) as total_cafes,
  COUNT(CASE WHEN accepting_orders = true THEN 1 END) as open_cafes,
  COUNT(CASE WHEN accepting_orders = false THEN 1 END) as closed_cafes
FROM public.cafes;
