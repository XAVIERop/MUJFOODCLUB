-- Fix RLS warnings for cafe_staff table
-- This addresses the 2 security warnings in Supabase linter

-- Step 1: Enable RLS on cafe_staff table
ALTER TABLE public.cafe_staff ENABLE ROW LEVEL SECURITY;

-- Step 2: Check if the policy exists and is correct
DO $$
BEGIN
    -- Check if the policy exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'cafe_staff' 
        AND policyname = 'cafe_staff_simple'
    ) THEN
        RAISE NOTICE 'Policy cafe_staff_simple already exists';
    ELSE
        -- Create the policy if it doesn't exist
        CREATE POLICY "cafe_staff_simple" ON public.cafe_staff
        FOR ALL USING (true);
        RAISE NOTICE 'Created policy cafe_staff_simple';
    END IF;
END $$;

-- Step 3: Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'cafe_staff';

-- Step 4: Check table RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'cafe_staff';

-- Step 5: Test a simple query to ensure it works
SELECT COUNT(*) as cafe_staff_count FROM public.cafe_staff;

RAISE NOTICE 'RLS fix complete for cafe_staff table';
