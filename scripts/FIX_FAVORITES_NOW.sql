-- IMMEDIATE FIX FOR FAVORITES ISSUE
-- Run this in Supabase SQL Editor to fix the favorites functionality

-- 1. Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.user_favorites;

-- 2. Create working RLS policies
CREATE POLICY "favorites_select_policy" ON public.user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "favorites_insert_policy" ON public.user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_delete_policy" ON public.user_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- 3. Ensure proper permissions
GRANT ALL ON public.user_favorites TO authenticated;

-- Success message
SELECT 'Favorites RLS policies fixed! Users can now add/remove favorites.' as status;
