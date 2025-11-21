-- ============================================================================
-- ALTERNATIVE RLS POLICY FIX - Using simpler condition
-- ============================================================================

-- Drop the existing policy
DROP POLICY IF EXISTS "users_create_own_orders" ON public.orders;

-- Create policy with simpler condition that should work for anonymous users
-- For anonymous users, auth.uid() returns NULL, so we check if user_id is NULL
CREATE POLICY "users_create_own_orders" ON public.orders
FOR INSERT
TO authenticated, anon
WITH CHECK (
  -- Allow if user_id matches auth.uid() (for authenticated users)
  -- OR if user_id is NULL (for guest/anonymous users)
  (user_id = auth.uid()) OR (user_id IS NULL)
);

-- Verify
SELECT 
  policyname,
  cmd,
  roles,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'orders'
  AND cmd = 'INSERT';

