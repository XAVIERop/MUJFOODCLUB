-- Fix existing users with @muj.manipal.edu who have wrong residency_scope
-- This updates all @muj.manipal.edu users to have 'ghs' residency_scope

-- First, show how many users will be affected
SELECT 
  COUNT(*) as affected_users,
  COUNT(CASE WHEN residency_scope = 'off_campus' THEN 1 END) as currently_off_campus,
  COUNT(CASE WHEN residency_scope IS NULL THEN 1 END) as currently_null,
  COUNT(CASE WHEN residency_scope = 'ghs' THEN 1 END) as already_correct
FROM public.profiles
WHERE email LIKE '%@muj.manipal.edu';

-- Update all @muj.manipal.edu users to have 'ghs' residency_scope
-- (This is the correct default for MUJ students)
UPDATE public.profiles
SET 
  residency_scope = 'ghs',
  updated_at = NOW()
WHERE 
  email LIKE '%@muj.manipal.edu'
  AND (residency_scope IS NULL OR residency_scope = 'off_campus');

-- Show the results after update
SELECT 
  'After Update:' as status,
  COUNT(*) as total_muj_users,
  COUNT(CASE WHEN residency_scope = 'ghs' THEN 1 END) as now_ghs,
  COUNT(CASE WHEN residency_scope = 'off_campus' THEN 1 END) as still_off_campus,
  COUNT(CASE WHEN residency_scope IS NULL THEN 1 END) as still_null
FROM public.profiles
WHERE email LIKE '%@muj.manipal.edu';

-- Show specific users that were updated
SELECT 
  id,
  email,
  full_name,
  residency_scope,
  block,
  created_at
FROM public.profiles
WHERE 
  email LIKE '%@muj.manipal.edu'
  AND residency_scope = 'ghs'
ORDER BY created_at DESC
LIMIT 20;

SELECT '✅ All @muj.manipal.edu users have been updated to GHS residency!' as status;

