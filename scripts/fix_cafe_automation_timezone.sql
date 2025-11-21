-- Fix Cafe Automation Timezone Issue
-- Supabase pg_cron uses UTC time, but we need IST (UTC+5:30)
-- 
-- IST to UTC conversion:
-- 2 AM IST = 8:30 PM UTC (previous day) = 20:30 UTC
-- 11 AM IST = 5:30 AM UTC = 05:30 UTC

-- First, clean up any existing cron jobs (safely)
DO $$
BEGIN
  -- Try to unschedule jobs, but don't fail if they don't exist
  BEGIN
    PERFORM cron.unschedule('auto-close-cafes-2am');
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  BEGIN
    PERFORM cron.unschedule('auto-reopen-cafes-11am');
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  BEGIN
    PERFORM cron.unschedule('close-cafes-2am');
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  BEGIN
    PERFORM cron.unschedule('reopen-cafes-11am');
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;

-- Create improved close function with IST timezone logging
CREATE OR REPLACE FUNCTION close_all_cafes_automated()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    closed_count INTEGER := 0;
    result JSON;
    ist_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Update all cafes to stop accepting orders
  UPDATE public.cafes 
  SET 
    accepting_orders = false,
    updated_at = NOW()
  WHERE accepting_orders = true;
  
  GET DIAGNOSTICS closed_count = ROW_COUNT;
  
  -- Get IST timestamp for logging (convert from UTC to IST)
  ist_timestamp := NOW() AT TIME ZONE 'Asia/Kolkata';
  
  -- Create result object
  result := json_build_object(
    'success', true,
    'timestamp', NOW(),
    'timestamp_ist', ist_timestamp,
    'action', 'close_all_cafes',
    'closed_count', closed_count,
    'message', 'All cafes closed successfully'
  );
  
  -- Log the operation with both UTC and IST
  RAISE NOTICE 'AUTOMATION: Closed % cafes at UTC: %, IST: %', closed_count, NOW(), ist_timestamp;
  
  RETURN result;
END;
$$;

-- Create improved reopen function with IST timezone logging
CREATE OR REPLACE FUNCTION reopen_all_cafes_automated()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    reopened_count INTEGER := 0;
    result JSON;
    ist_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Update all cafes to start accepting orders
  UPDATE public.cafes 
  SET 
    accepting_orders = true,
    updated_at = NOW()
  WHERE accepting_orders = false;
  
  GET DIAGNOSTICS reopened_count = ROW_COUNT;
  
  -- Get IST timestamp for logging (convert from UTC to IST)
  ist_timestamp := NOW() AT TIME ZONE 'Asia/Kolkata';
  
  -- Create result object
  result := json_build_object(
    'success', true,
    'timestamp', NOW(),
    'timestamp_ist', ist_timestamp,
    'action', 'reopen_all_cafes',
    'reopened_count', reopened_count,
    'message', 'All cafes reopened successfully'
  );
  
  -- Log the operation with both UTC and IST
  RAISE NOTICE 'AUTOMATION: Reopened % cafes at UTC: %, IST: %', reopened_count, NOW(), ist_timestamp;
  
  RETURN result;
END;
$$;

-- Schedule the close function to run daily at 2 AM IST (8:30 PM UTC previous day)
-- Cron format: minute hour day month weekday
-- 2 AM IST = 20:30 UTC (previous day) = 30 20 * * *
SELECT cron.schedule(
  'auto-close-cafes-2am-ist',              -- job name
  '30 20 * * *',                           -- cron expression (8:30 PM UTC = 2:00 AM IST next day)
  'SELECT close_all_cafes_automated();'    -- SQL to execute
);

-- Schedule the reopen function to run daily at 11 AM IST (5:30 AM UTC)
-- 11 AM IST = 5:30 AM UTC = 30 5 * * *
SELECT cron.schedule(
  'auto-reopen-cafes-11am-ist',            -- job name
  '30 5 * * *',                            -- cron expression (5:30 AM UTC = 11:00 AM IST)
  'SELECT reopen_all_cafes_automated();'   -- SQL to execute
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION close_all_cafes_automated() TO authenticated;
GRANT EXECUTE ON FUNCTION close_all_cafes_automated() TO service_role;
GRANT EXECUTE ON FUNCTION reopen_all_cafes_automated() TO authenticated;
GRANT EXECUTE ON FUNCTION reopen_all_cafes_automated() TO service_role;

-- Create a monitoring function to check automation status with IST timezone
CREATE OR REPLACE FUNCTION check_automation_status()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    open_cafes INTEGER;
    closed_cafes INTEGER;
    total_cafes INTEGER;
    result JSON;
    ist_timestamp TIMESTAMP WITH TIME ZONE;
    cron_jobs JSON;
BEGIN
  -- Count cafe statuses
  SELECT 
    COUNT(*) FILTER (WHERE accepting_orders = true),
    COUNT(*) FILTER (WHERE accepting_orders = false),
    COUNT(*)
  INTO open_cafes, closed_cafes, total_cafes
  FROM public.cafes;
  
  -- Get IST timestamp (convert from UTC to IST)
  ist_timestamp := NOW() AT TIME ZONE 'Asia/Kolkata';
  
  -- Get scheduled cron jobs
  SELECT json_agg(
    json_build_object(
      'jobname', jobname,
      'schedule', schedule,
      'command', command,
      'active', active
    )
  )
  INTO cron_jobs
  FROM cron.job
  WHERE jobname LIKE '%cafe%';
  
  -- Create status object
  result := json_build_object(
    'timestamp_utc', NOW(),
    'timestamp_ist', ist_timestamp,
    'total_cafes', total_cafes,
    'open_cafes', open_cafes,
    'closed_cafes', closed_cafes,
    'automation_active', true,
    'scheduled_jobs', cron_jobs
  );
  
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION check_automation_status() TO authenticated;
GRANT EXECUTE ON FUNCTION check_automation_status() TO service_role;

-- Show scheduled jobs
SELECT 'Scheduled cron jobs (should show IST times):' as info;
SELECT 
  jobname,
  schedule,
  command,
  active,
  'Note: Schedule times are in UTC. 20:30 UTC = 2:00 AM IST, 05:30 UTC = 11:00 AM IST' as timezone_note
FROM cron.job
WHERE jobname LIKE '%cafe%';

-- Test the functions manually (optional - comment out in production)
-- SELECT 'Testing close function...' as status;
-- SELECT close_all_cafes_automated();

-- SELECT 'Testing reopen function...' as status;
-- SELECT reopen_all_cafes_automated();

-- Check automation status
SELECT 'Checking automation status...' as status;
SELECT check_automation_status();





