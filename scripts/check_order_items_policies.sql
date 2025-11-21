-- Check current RLS policies on order_items table
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'order_items'
ORDER BY cmd, policyname;

