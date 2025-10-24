-- Simple auto-close cafes at 2 AM using Supabase's built-in pg_cron
-- This is much simpler than GitHub Actions + Edge Functions

-- Enable the pg_cron extension (if not already enabled)
-- You can enable this in Supabase Dashboard -> Database -> Extensions

-- Create a simple function to close all cafes
CREATE OR REPLACE FUNCTION close_all_cafes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update all cafes to stop accepting orders
  UPDATE public.cafes 
  SET 
    accepting_orders = false,
    updated_at = NOW()
  WHERE accepting_orders = true;
  
  -- Log the operation
  RAISE NOTICE 'All cafes closed at %', NOW();
END;
$$;

-- Schedule the function to run daily at 2 AM
-- This uses Supabase's built-in pg_cron extension
SELECT cron.schedule(
  'close-cafes-2am',           -- job name
  '0 2 * * *',                 -- cron expression (2 AM daily)
  'SELECT close_all_cafes();'  -- SQL to execute
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION close_all_cafes() TO authenticated;
GRANT EXECUTE ON FUNCTION close_all_cafes() TO service_role;

-- Test the function manually (optional)
-- SELECT close_all_cafes();
