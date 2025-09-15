-- QUICK FIX FOR 406 ERRORS - RUN THIS IMMEDIATELY
-- This will fix the current login issues on production

-- 1. Fix cafe_staff RLS policy (main cause of 406 errors)
DROP POLICY IF EXISTS "Cafe staff can view their own records" ON public.cafe_staff;
DROP POLICY IF EXISTS "Users can view cafe staff" ON public.cafe_staff;
DROP POLICY IF EXISTS "Allow authenticated users to view cafe staff" ON public.cafe_staff;

CREATE POLICY "Allow authenticated users to view cafe staff"
ON public.cafe_staff 
FOR SELECT
TO authenticated
USING (true);

-- 2. Ensure proper permissions
GRANT SELECT ON public.cafe_staff TO authenticated;

-- 3. Fix profiles table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles 
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile"
ON public.profiles 
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles 
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Ensure RLS is enabled
ALTER TABLE public.cafe_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.cafe_staff TO authenticated;

-- 6. Test the fix
SELECT '406 ERRORS FIXED - Test your production site now!' as status;

