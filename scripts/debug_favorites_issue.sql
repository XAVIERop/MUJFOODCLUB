-- Debug Favorites Issue
-- This script helps diagnose the exact problem

-- 1. Check if the user exists in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE id = '25cef671-21b4-4616-b359-a5bd8f5d638c';

-- 2. Check if the user has a profile
SELECT id, email, full_name, user_type 
FROM public.profiles 
WHERE id = '25cef671-21b4-4616-b359-a5bd8f5d638c';

-- 3. Check current RLS policies on user_favorites
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_favorites';

-- 4. Check table permissions
SELECT grantee, privilege_type 
FROM information_schema.table_privileges 
WHERE table_name = 'user_favorites' AND table_schema = 'public';

-- 5. Test if we can select from the table (should work)
SELECT COUNT(*) as total_favorites FROM public.user_favorites;

-- 6. Check if there are any existing favorites for this user
SELECT COUNT(*) as user_favorites_count 
FROM public.user_favorites 
WHERE user_id = '25cef671-21b4-4616-b359-a5bd8f5d638c';

-- 7. Show the current auth context (this will show the current user)
SELECT auth.uid() as current_auth_uid;

-- 8. Test insert permission (this might fail, that's expected)
-- We'll comment this out to avoid errors
-- INSERT INTO public.user_favorites (user_id, cafe_id) 
-- VALUES ('25cef671-21b4-4616-b359-a5bd8f5d638c', 'test-cafe-id');

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Favorites debug completed!';
    RAISE NOTICE 'Check the results above to identify the issue.';
END $$;
