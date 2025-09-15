-- Fix Cafe Staff Infinite Recursion Issue
-- This script fixes the infinite recursion error in cafe_staff RLS policies

-- First, let's check the current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'cafe_staff';

-- Drop the problematic optimized policy that's causing infinite recursion
DROP POLICY IF EXISTS "cafe_staff_optimized_policy" ON public.cafe_staff;

-- Create a simple, non-recursive policy for cafe staff
CREATE POLICY "cafe_staff_simple_policy" ON public.cafe_staff
    FOR ALL USING (
        (SELECT auth.uid()) = user_id
    );

-- Also create a policy for cafe owners to manage their staff
CREATE POLICY "cafe_owners_manage_staff" ON public.cafe_staff
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = (SELECT auth.uid()) 
            AND profiles.user_type = 'cafe_owner'
            AND profiles.cafe_id = cafe_staff.cafe_id
        )
    );

-- Grant necessary permissions
GRANT ALL ON public.cafe_staff TO authenticated;
GRANT SELECT ON public.cafe_staff TO anon;

-- Verify the new policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'cafe_staff'
ORDER BY policyname;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Cafe staff infinite recursion issue fixed!';
    RAISE NOTICE '✅ Simple, non-recursive policies created';
    RAISE NOTICE '✅ Users can access their own cafe_staff records';
    RAISE NOTICE '✅ Cafe owners can manage their staff';
END $$;
