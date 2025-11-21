-- ============================================================================
-- FIX RLS POLICY - Explicit NULL handling for anonymous users
-- ============================================================================

-- Drop the existing policy
DROP POLICY IF EXISTS "users_create_own_orders" ON public.orders;

-- Create policy with explicit handling of NULL cases
-- This ensures that when auth.uid() is NULL (anonymous user), 
-- the policy correctly allows user_id IS NULL
CREATE POLICY "users_create_own_orders" ON public.orders
FOR INSERT
TO authenticated, anon
WITH CHECK (
  -- Case 1: Authenticated user - user_id must match auth.uid()
  (auth.uid() IS NOT NULL AND user_id IS NOT NULL AND user_id = auth.uid())
  OR
  -- Case 2: Anonymous user - both auth.uid() and user_id must be NULL
  (auth.uid() IS NULL AND user_id IS NULL)
);

-- Verify the policy
SELECT 
  policyname,
  cmd,
  roles,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'orders'
  AND cmd = 'INSERT';

