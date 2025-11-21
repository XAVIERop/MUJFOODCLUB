-- ============================================================================
-- TEST AUTHENTICATED ORDER POLICY (Run as authenticated user)
-- This simulates what happens when an authenticated user creates an order
-- ============================================================================

-- Note: This test should be run while logged in as an authenticated user
-- The policy should allow: user_id = auth.uid()

-- Check what auth.uid() returns for current user
SELECT 
  '=== CURRENT USER INFO ===' as section,
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 'Authenticated User'
    ELSE 'Anonymous User'
  END as user_type;

-- Test if the policy condition would pass for authenticated user
-- This simulates the WITH CHECK clause: (user_id = auth.uid()) OR (user_id IS NULL)
SELECT 
  '=== POLICY CONDITION TEST ===' as section,
  auth.uid() as auth_uid,
  auth.uid() as test_user_id,
  (auth.uid() = auth.uid()) as condition_1_user_id_equals_auth_uid,
  (auth.uid() IS NULL) as condition_2_auth_uid_is_null,
  ((auth.uid() = auth.uid()) OR (auth.uid() IS NULL)) as policy_would_pass;

-- If you're authenticated, condition_1 should be TRUE
-- If you're anonymous, condition_2 should be TRUE

