-- Check Current Points Function
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Check if the old function with multipliers still exists
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname = 'calculate_new_points';

-- 2. Test current function behavior
SELECT 
  'Current Function Test' as test,
  calculate_new_points(1000, 'foodie', true, 1) as points_earned,
  'Expected: 50 points (no multipliers)' as expected;

-- 3. Check if there are any other points calculation functions
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname LIKE '%point%' OR proname LIKE '%reward%';

-- 4. Check if the old enhanced points function exists
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname = 'calculate_enhanced_points';
