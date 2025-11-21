-- ============================================================================
-- VERIFY AUTHENTICATED ORDERS STILL WORK
-- This script checks if the current RLS policies allow authenticated users
-- to create orders with their user_id
-- ============================================================================

-- Step 1: Check current INSERT policy
SELECT 
  '=== CURRENT INSERT POLICY ===' as section,
  policyname,
  cmd,
  roles,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'orders'
  AND cmd = 'INSERT';

-- Step 2: Check all policies on orders table
SELECT 
  '=== ALL POLICIES ON ORDERS TABLE ===' as section,
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'orders'
ORDER BY cmd, policyname;

-- Step 3: Verify the policy logic
-- The INSERT policy should allow:
-- 1. Authenticated users: (auth.uid() IS NOT NULL AND user_id = auth.uid())
-- 2. Anonymous users: (auth.uid() IS NULL AND user_id IS NULL)
-- OR the simpler version: ((user_id = auth.uid()) OR (user_id IS NULL))

-- Step 4: Check if there are any conflicting policies
SELECT 
  '=== CHECKING FOR CONFLICTING POLICIES ===' as section,
  COUNT(*) as total_insert_policies
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'orders'
  AND cmd = 'INSERT';

-- Step 5: Verify RLS is enabled
SELECT 
  '=== RLS STATUS ===' as section,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'orders';

-- Step 6: Check the validate_order_placement trigger
SELECT 
  '=== VALIDATE ORDER TRIGGER ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'orders'
  AND trigger_name = 'validate_order_placement_trigger';

