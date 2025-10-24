-- Test the new automation system
-- Run this in Supabase Dashboard → SQL Editor

-- First, check current cafe status
SELECT 'Current cafe status:' as info;
SELECT 
  name,
  accepting_orders,
  updated_at
FROM public.cafes 
ORDER BY name;

-- Test the close function
SELECT 'Testing close function...' as test;
SELECT close_all_cafes_automated();

-- Check status after closing
SELECT 'Status after closing:' as info;
SELECT 
  name,
  accepting_orders,
  updated_at
FROM public.cafes 
ORDER BY name;

-- Test the reopen function
SELECT 'Testing reopen function...' as test;
SELECT reopen_all_cafes_automated();

-- Check status after reopening
SELECT 'Status after reopening:' as info;
SELECT 
  name,
  accepting_orders,
  updated_at
FROM public.cafes 
ORDER BY name;

-- Check automation status
SELECT 'Automation status:' as info;
SELECT check_automation_status();

-- Check scheduled cron jobs
SELECT 'Scheduled cron jobs:' as info;
SELECT 
  jobname,
  schedule,
  command,
  active
FROM cron.job;
