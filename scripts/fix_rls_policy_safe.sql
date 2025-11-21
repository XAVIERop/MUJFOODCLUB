-- ============================================================================
-- SAFE RLS POLICY FIX (waits for locks to clear)
-- ============================================================================

-- First, let's check if there are any active queries blocking us
-- (Run this separately if needed to see what's blocking)
-- SELECT pid, usename, application_name, state, query 
-- FROM pg_stat_activity 
-- WHERE datname = current_database() 
--   AND state != 'idle';

-- Wait a moment for any active transactions to complete
-- Then try dropping and recreating the policy

-- Drop the existing INSERT policy (if it exists)
DO $$
BEGIN
  -- Try to drop the policy, ignore if it doesn't exist
  DROP POLICY IF EXISTS "users_create_own_orders" ON public.orders;
EXCEPTION
  WHEN OTHERS THEN
    -- If there's a lock, wait and try again
    PERFORM pg_sleep(1);
    DROP POLICY IF EXISTS "users_create_own_orders" ON public.orders;
END $$;

-- Create the new INSERT policy with explicit anonymous user handling
CREATE POLICY "users_create_own_orders" ON public.orders
FOR INSERT
TO authenticated, anon
WITH CHECK (
  -- Case 1: Authenticated user creating their own order
  (auth.uid() IS NOT NULL AND user_id IS NOT NULL AND user_id = auth.uid())
  OR
  -- Case 2: Anonymous user creating a guest order (user_id must be NULL)
  (auth.uid() IS NULL AND user_id IS NULL)
);

-- Verify the policy was created
SELECT 
  policyname,
  cmd,
  roles,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'orders'
  AND cmd = 'INSERT';

