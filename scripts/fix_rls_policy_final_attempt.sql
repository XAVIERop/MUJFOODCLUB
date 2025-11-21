-- ============================================================================
-- FINAL RLS POLICY FIX - Explicit NULL handling
-- ============================================================================

-- Drop the existing policy
DROP POLICY IF EXISTS "users_create_own_orders" ON public.orders;

-- Create policy with explicit NULL handling using COALESCE
-- This ensures NULL comparisons work correctly
CREATE POLICY "users_create_own_orders" ON public.orders
FOR INSERT
TO authenticated, anon
WITH CHECK (
  -- For authenticated users: user_id must equal auth.uid()
  -- For anonymous users: user_id must be NULL
  -- Using COALESCE to handle NULL comparisons properly
  COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid) = 
  COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
  OR
  (user_id IS NULL AND auth.uid() IS NULL)
);

-- Alternative simpler version if above doesn't work:
-- Uncomment this and comment out the above if needed
/*
CREATE POLICY "users_create_own_orders" ON public.orders
FOR INSERT
TO authenticated, anon
WITH CHECK (
  -- Allow authenticated users to create orders with their user_id
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  -- Allow anonymous users to create orders with NULL user_id
  (auth.uid() IS NULL AND user_id IS NULL)
);
*/

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

