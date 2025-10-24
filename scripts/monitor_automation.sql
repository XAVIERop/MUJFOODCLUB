-- Monitor Cafe Automation System
-- Run this anytime to check automation status

-- Check current cafe status
SELECT 
  'CURRENT CAFE STATUS' as section,
  COUNT(*) as total_cafes,
  COUNT(CASE WHEN accepting_orders = true THEN 1 END) as open_cafes,
  COUNT(CASE WHEN accepting_orders = false THEN 1 END) as closed_cafes
FROM public.cafes;

-- Show individual cafe status
SELECT 
  'INDIVIDUAL CAFE STATUS' as section,
  name,
  accepting_orders,
  updated_at
FROM public.cafes 
ORDER BY accepting_orders DESC, name;

-- Check automation status
SELECT 
  'AUTOMATION STATUS' as section,
  check_automation_status();

-- Check scheduled cron jobs
SELECT 
  'SCHEDULED JOBS' as section,
  jobname,
  schedule,
  command,
  active,
  created
FROM cron.job
WHERE jobname LIKE '%cafe%';

-- Check recent automation logs (if any)
SELECT 
  'RECENT ACTIVITY' as section,
  'Check Supabase logs for automation activity' as note;
