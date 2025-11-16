-- Verify push subscriptions table setup
-- Run this to check if everything is configured correctly

-- 1. Check if table exists
SELECT 
  'push_subscriptions table exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'push_subscriptions'
    ) THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status;

-- 2. Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'push_subscriptions'
ORDER BY ordinal_position;

-- 3. Check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'push_subscriptions';

-- 4. Check RLS policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'push_subscriptions';

-- 5. Check functions
SELECT 
  'get_user_push_subscriptions function' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.proname = 'get_user_push_subscriptions'
    ) THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status;

SELECT 
  'get_cafe_staff_push_subscriptions function' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.proname = 'get_cafe_staff_push_subscriptions'
    ) THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status;

-- 6. Summary
SELECT 
  'Setup Summary' as summary,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'push_subscriptions') as table_exists,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'push_subscriptions') as column_count,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'push_subscriptions') as index_count,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'push_subscriptions') as policy_count;

