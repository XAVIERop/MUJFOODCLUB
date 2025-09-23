-- Fix Favorites RLS Policy Issue
-- This script fixes the RLS policy that's preventing favorites from being added

-- First, let's check the current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_favorites';

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.user_favorites;

-- Create corrected RLS policies with proper syntax
CREATE POLICY "users_view_own_favorites" ON public.user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_favorites" ON public.user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_favorites" ON public.user_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'user_favorites';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Favorites RLS policies fixed successfully!';
    RAISE NOTICE 'Users can now add/remove favorites properly.';
END $$;
