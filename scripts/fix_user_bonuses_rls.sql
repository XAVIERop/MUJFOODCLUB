-- Fix User Bonuses RLS Policy Issue
-- This is what's actually causing the "Mark Complete" button to fail
-- Run this script in your Supabase SQL Editor

-- 1. Check if user_bonuses table exists and its current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'user_bonuses';

-- 2. Check existing RLS policies on user_bonuses
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_bonuses';

-- 3. Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_bonuses' 
ORDER BY ordinal_position;

-- 4. Fix the RLS policies - Allow cafe owners to update user_bonuses
DO $$
BEGIN
    -- Enable RLS if not already enabled
    ALTER TABLE public.user_bonuses ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies that might be too restrictive
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_bonuses;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_bonuses;
    DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.user_bonuses;
    DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.user_bonuses;
    
    -- Create new policies that allow cafe owners to manage user_bonuses
    CREATE POLICY "Allow cafe owners to manage user_bonuses" ON public.user_bonuses
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.user_type = 'cafe_owner'
            )
        );
    
    -- Also allow users to read their own bonuses
    CREATE POLICY "Allow users to read own bonuses" ON public.user_bonuses
        FOR SELECT USING (
            user_id = auth.uid()
        );
    
    RAISE NOTICE 'RLS policies updated for user_bonuses table';
END $$;

-- 5. Grant necessary permissions
GRANT ALL ON public.user_bonuses TO authenticated;

-- 6. Verify the fix
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'user_bonuses';

-- Show completion message
DO $$
BEGIN
    RAISE NOTICE 'User bonuses RLS issue fixed. Try "Mark Complete" button now!';
END $$;
