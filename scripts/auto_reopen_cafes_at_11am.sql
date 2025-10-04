-- Auto-reopen all cafes at 11 AM daily
-- This complements the auto-close at 2 AM system

-- Create a function to reopen all cafes
CREATE OR REPLACE FUNCTION reopen_all_cafes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update all cafes to start accepting orders
  UPDATE public.cafes 
  SET 
    accepting_orders = true,
    updated_at = NOW()
  WHERE accepting_orders = false;
  
  -- Log the operation
  RAISE NOTICE 'All cafes reopened at %', NOW();
END;
$$;

-- Schedule the function to run daily at 11 AM
SELECT cron.schedule(
  'reopen-cafes-11am',           -- job name
  '0 11 * * *',                  -- cron expression (11 AM daily)
  'SELECT reopen_all_cafes();'   -- SQL to execute
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION reopen_all_cafes() TO authenticated;
GRANT EXECUTE ON FUNCTION reopen_all_cafes() TO service_role;

-- Test the function manually (optional)
-- SELECT reopen_all_cafes();
