-- Fix Cafe Automation System
-- Consolidated approach using only Supabase pg_cron
-- This replaces all other automation methods

-- First, clean up any existing cron jobs (safely)
DO $$
BEGIN
  -- Try to unschedule jobs, but don't fail if they don't exist
  BEGIN
    PERFORM cron.unschedule('close-cafes-2am');
  EXCEPTION WHEN OTHERS THEN
    -- Job doesn't exist, that's fine
    NULL;
  END;
  
  BEGIN
    PERFORM cron.unschedule('reopen-cafes-11am');
  EXCEPTION WHEN OTHERS THEN
    -- Job doesn't exist, that's fine
    NULL;
  END;
  
  BEGIN
    PERFORM cron.unschedule('auto-reopen-cafes');
  EXCEPTION WHEN OTHERS THEN
    -- Job doesn't exist, that's fine
    NULL;
  END;
  
  BEGIN
    PERFORM cron.unschedule('auto-close-cafes-2am');
  EXCEPTION WHEN OTHERS THEN
    -- Job doesn't exist, that's fine
    NULL;
  END;
  
  BEGIN
    PERFORM cron.unschedule('auto-reopen-cafes-11am');
  EXCEPTION WHEN OTHERS THEN
    -- Job doesn't exist, that's fine
    NULL;
  END;
END $$;

-- Create improved close function with logging
CREATE OR REPLACE FUNCTION close_all_cafes_automated()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    closed_count INTEGER := 0;
    result JSON;
BEGIN
  -- Update all cafes to stop accepting orders
  UPDATE public.cafes 
  SET 
    accepting_orders = false,
    updated_at = NOW()
  WHERE accepting_orders = true;
  
  GET DIAGNOSTICS closed_count = ROW_COUNT;
  
  -- Create result object
  result := json_build_object(
    'success', true,
    'timestamp', NOW(),
    'action', 'close_all_cafes',
    'closed_count', closed_count,
    'message', 'All cafes closed successfully'
  );
  
  -- Log the operation
  RAISE NOTICE 'AUTOMATION: Closed % cafes at %', closed_count, NOW();
  
  RETURN result;
END;
$$;

-- Create improved reopen function with logging
CREATE OR REPLACE FUNCTION reopen_all_cafes_automated()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    reopened_count INTEGER := 0;
    result JSON;
BEGIN
  -- Update all cafes to start accepting orders
  UPDATE public.cafes 
  SET 
    accepting_orders = true,
    updated_at = NOW()
  WHERE accepting_orders = false;
  
  GET DIAGNOSTICS reopened_count = ROW_COUNT;
  
  -- Create result object
  result := json_build_object(
    'success', true,
    'timestamp', NOW(),
    'action', 'reopen_all_cafes',
    'reopened_count', reopened_count,
    'message', 'All cafes reopened successfully'
  );
  
  -- Log the operation
  RAISE NOTICE 'AUTOMATION: Reopened % cafes at %', reopened_count, NOW();
  
  RETURN result;
END;
$$;

-- Schedule the close function to run daily at 2 AM
SELECT cron.schedule(
  'auto-close-cafes-2am',                    -- job name
  '0 2 * * *',                              -- cron expression (2 AM daily)
  'SELECT close_all_cafes_automated();'     -- SQL to execute
);

-- Schedule the reopen function to run daily at 11 AM
SELECT cron.schedule(
  'auto-reopen-cafes-11am',                 -- job name
  '0 11 * * *',                             -- cron expression (11 AM daily)
  'SELECT reopen_all_cafes_automated();'    -- SQL to execute
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION close_all_cafes_automated() TO authenticated;
GRANT EXECUTE ON FUNCTION close_all_cafes_automated() TO service_role;
GRANT EXECUTE ON FUNCTION reopen_all_cafes_automated() TO authenticated;
GRANT EXECUTE ON FUNCTION reopen_all_cafes_automated() TO service_role;

-- Create a monitoring function to check automation status
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
BEGIN
  -- Count cafe statuses
  SELECT 
    COUNT(*) FILTER (WHERE accepting_orders = true),
    COUNT(*) FILTER (WHERE accepting_orders = false),
    COUNT(*)
  INTO open_cafes, closed_cafes, total_cafes
  FROM public.cafes;
  
  -- Create status object
  result := json_build_object(
    'timestamp', NOW(),
    'total_cafes', total_cafes,
    'open_cafes', open_cafes,
    'closed_cafes', closed_cafes,
    'automation_active', true
  );
  
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION check_automation_status() TO authenticated;
GRANT EXECUTE ON FUNCTION check_automation_status() TO service_role;

-- Test the functions manually
SELECT 'Testing close function...' as status;
SELECT close_all_cafes_automated();

SELECT 'Testing reopen function...' as status;
SELECT reopen_all_cafes_automated();

SELECT 'Checking automation status...' as status;
SELECT check_automation_status();

-- Show scheduled jobs
SELECT 'Scheduled cron jobs:' as info;
SELECT * FROM cron.job;
