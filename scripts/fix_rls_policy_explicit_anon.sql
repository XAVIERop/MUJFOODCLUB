-- ============================================================================
-- FIX RLS POLICY WITH EXPLICIT ANONYMOUS USER HANDLING
-- ============================================================================

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "users_create_own_orders" ON public.orders;

-- Create a more explicit INSERT policy that clearly handles anonymous users
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

