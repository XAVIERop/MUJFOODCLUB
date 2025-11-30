-- Update Cafe Opening Times
-- Specific cafes should open at 11 PM instead of 11 AM
-- Cafes: Chatkara, Punjabi Tadka, Munchbox, Grabit

-- First, create a function to reopen cafes at 11 AM (for regular cafes)
CREATE OR REPLACE FUNCTION reopen_regular_cafes_11am()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    reopened_count INTEGER := 0;
    result JSON;
    ist_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Update cafes to start accepting orders, EXCEPT the late-night cafes
  UPDATE public.cafes 
  SET 
    accepting_orders = true,
    updated_at = NOW()
  WHERE accepting_orders = false
    AND name NOT IN ('CHATKARA', 'Punjabi Tadka', 'Munch Box')
    AND (name NOT ILIKE '%grabit%' AND slug NOT ILIKE 'grabit');
  
  GET DIAGNOSTICS reopened_count = ROW_COUNT;
  
  -- Get IST timestamp for logging
  ist_timestamp := NOW() AT TIME ZONE 'Asia/Kolkata';
  
  -- Create result object
  result := json_build_object(
    'success', true,
    'timestamp', NOW(),
    'timestamp_ist', ist_timestamp,
    'action', 'reopen_regular_cafes_11am',
    'reopened_count', reopened_count,
    'message', 'Regular cafes reopened at 11 AM successfully'
  );
  
  -- Log the operation
  RAISE NOTICE 'AUTOMATION: Reopened % regular cafes at 11 AM IST (UTC: %, IST: %)', 
    reopened_count, NOW(), ist_timestamp;
  
  RETURN result;
END;
$$;

-- Create a function to reopen late-night cafes at 11 PM
CREATE OR REPLACE FUNCTION reopen_late_night_cafes_11pm()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    reopened_count INTEGER := 0;
    result JSON;
    ist_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Update late-night cafes to start accepting orders at 11 PM
  UPDATE public.cafes 
  SET 
    accepting_orders = true,
    updated_at = NOW()
  WHERE accepting_orders = false
    AND (name IN ('CHATKARA', 'Punjabi Tadka', 'Munch Box') 
         OR name ILIKE '%grabit%' 
         OR slug ILIKE 'grabit');
  
  GET DIAGNOSTICS reopened_count = ROW_COUNT;
  
  -- Get IST timestamp for logging
  ist_timestamp := NOW() AT TIME ZONE 'Asia/Kolkata';
  
  -- Create result object
  result := json_build_object(
    'success', true,
    'timestamp', NOW(),
    'timestamp_ist', ist_timestamp,
    'action', 'reopen_late_night_cafes_11pm',
    'reopened_count', reopened_count,
    'message', 'Late-night cafes reopened at 11 PM successfully'
  );
  
  -- Log the operation
  RAISE NOTICE 'AUTOMATION: Reopened % late-night cafes at 11 PM IST (UTC: %, IST: %)', 
    reopened_count, NOW(), ist_timestamp;
  
  RETURN result;
END;
$$;

-- Clean up old automation jobs
DO $$
BEGIN
  -- Try to unschedule old jobs, but don't fail if they don't exist
  BEGIN
    PERFORM cron.unschedule('auto-reopen-cafes-11am-ist');
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;

-- Schedule the regular cafes to reopen at 11 AM IST (5:30 AM UTC)
-- 11 AM IST = 5:30 AM UTC = 30 5 * * *
SELECT cron.schedule(
  'auto-reopen-regular-cafes-11am-ist',
  '30 5 * * *',
  'SELECT reopen_regular_cafes_11am();'
);

-- Schedule the late-night cafes to reopen at 11 PM IST (5:30 PM UTC)
-- 11 PM IST = 17:30 UTC (same day) = 30 17 * * *
SELECT cron.schedule(
  'auto-reopen-late-night-cafes-11pm-ist',
  '30 17 * * *',
  'SELECT reopen_late_night_cafes_11pm();'
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION reopen_regular_cafes_11am() TO authenticated;
GRANT EXECUTE ON FUNCTION reopen_regular_cafes_11am() TO service_role;
GRANT EXECUTE ON FUNCTION reopen_late_night_cafes_11pm() TO authenticated;
GRANT EXECUTE ON FUNCTION reopen_late_night_cafes_11pm() TO service_role;

-- Show scheduled jobs
SELECT 'Scheduled cron jobs:' as info;
SELECT 
  jobname,
  schedule,
  command,
  active,
  CASE 
    WHEN jobname = 'auto-reopen-regular-cafes-11am-ist' THEN 'Regular cafes reopen at 11 AM IST (5:30 AM UTC)'
    WHEN jobname = 'auto-reopen-late-night-cafes-11pm-ist' THEN 'Late-night cafes reopen at 11 PM IST (5:30 PM UTC)'
    ELSE 'Other job'
  END as description
FROM cron.job
WHERE jobname LIKE '%cafe%' OR jobname LIKE '%reopen%'
ORDER BY jobname;

-- Show which cafes will be affected
SELECT 'Late-night cafes (will open at 11 PM):' as info;
SELECT name, slug, accepting_orders, is_active
FROM public.cafes
WHERE name IN ('CHATKARA', 'Punjabi Tadka', 'Munch Box')
   OR name ILIKE '%grabit%'
   OR slug ILIKE 'grabit'
ORDER BY name;

-- Show regular cafes (will open at 11 AM)
SELECT 'Regular cafes (will open at 11 AM):' as info;
SELECT name, slug, accepting_orders, is_active
FROM public.cafes
WHERE name NOT IN ('CHATKARA', 'Punjabi Tadka', 'Munch Box')
  AND name NOT ILIKE '%grabit%'
  AND slug NOT ILIKE 'grabit'
ORDER BY name;

