-- Add residency_scope column to profiles table
-- This column determines whether a user is GHS (on-campus) or off-campus

-- Step 1: Add the column with a default value
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS residency_scope TEXT DEFAULT 'off_campus';

-- Step 2: Add constraint to ensure valid values
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_residency_scope_check 
CHECK (residency_scope IN ('ghs', 'off_campus'));

-- Step 3: Set residency_scope based on email domain for existing users
-- @mujfoodclub.in accounts -> 'ghs' (full access)
-- @muj.manipal.edu accounts -> 'ghs' by default (can be updated if they're actually off-campus)
-- All other emails -> 'off_campus'
UPDATE public.profiles
SET residency_scope = CASE
  WHEN email LIKE '%@mujfoodclub.in' THEN 'ghs'
  WHEN email LIKE '%@muj.manipal.edu' THEN 'ghs'  -- Default to GHS, can be manually updated if needed
  ELSE 'off_campus'
END
WHERE residency_scope IS NULL OR residency_scope = 'off_campus';

-- Step 4: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_residency_scope 
ON public.profiles(residency_scope);

-- Step 5: Verify the update
SELECT 
  residency_scope,
  COUNT(*) as user_count,
  COUNT(*) FILTER (WHERE email LIKE '%@mujfoodclub.in') as mujfoodclub_users,
  COUNT(*) FILTER (WHERE email LIKE '%@muj.manipal.edu') as muj_users,
  COUNT(*) FILTER (WHERE email NOT LIKE '%@mujfoodclub.in' AND email NOT LIKE '%@muj.manipal.edu') as other_users
FROM public.profiles
GROUP BY residency_scope;

-- Show sample of updated profiles
SELECT 
  id,
  email,
  residency_scope,
  full_name,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

SELECT 'residency_scope column added successfully!' as status;

