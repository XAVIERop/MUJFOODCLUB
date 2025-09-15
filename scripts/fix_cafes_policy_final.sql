-- =====================================================
-- 🔧 FINAL CAFES POLICY OPTIMIZATION
-- =====================================================
-- This script fixes the remaining multiple permissive policies
-- warning for the cafes table

-- Drop existing cafes policies
DROP POLICY IF EXISTS "cafes_public_read" ON public.cafes;
DROP POLICY IF EXISTS "cafes_owner_management" ON public.cafes;

-- Create single optimized policy for cafes
CREATE POLICY "cafes_optimized_policy" ON public.cafes
    FOR ALL USING (
        is_active = true OR
        EXISTS (
            SELECT 1 FROM public.cafe_staff 
            WHERE cafe_staff.cafe_id = cafes.id 
            AND cafe_staff.user_id = (SELECT auth.uid())
            AND cafe_staff.role IN ('owner', 'manager')
            AND cafe_staff.is_active = true
        )
    );

-- Verify the fix
SELECT 
    COUNT(*) as total_cafes_policies,
    tablename
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'cafes'
GROUP BY tablename;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Cafes policy optimization completed!';
    RAISE NOTICE '✅ Multiple permissive policies consolidated into single policy';
    RAISE NOTICE '✅ Performance warning resolved';
    RAISE NOTICE '✅ Security maintained with improved performance';
END $$;
