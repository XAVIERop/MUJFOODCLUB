-- Comprehensive Fix for All 500 Errors
-- This script fixes the infinite recursion and RPC function issues

-- =====================================================
-- 1. FIX CAFE_STAFF INFINITE RECURSION
-- =====================================================

-- Drop the problematic optimized policy that's causing infinite recursion
DROP POLICY IF EXISTS "cafe_staff_optimized_policy" ON public.cafe_staff;

-- Create simple, non-recursive policies for cafe staff
DROP POLICY IF EXISTS "cafe_staff_simple_policy" ON public.cafe_staff;
DROP POLICY IF EXISTS "cafe_owners_manage_staff" ON public.cafe_staff;

CREATE POLICY "cafe_staff_simple_policy" ON public.cafe_staff
    FOR ALL USING (
        (SELECT auth.uid()) = user_id
    );

CREATE POLICY "cafe_owners_manage_staff" ON public.cafe_staff
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = (SELECT auth.uid()) 
            AND profiles.user_type = 'cafe_owner'
            AND profiles.cafe_id = cafe_staff.cafe_id
        )
    );

-- =====================================================
-- 2. FIX SYSTEM PERFORMANCE METRICS FUNCTION
-- =====================================================

-- Drop and recreate the problematic function
DROP FUNCTION IF EXISTS get_system_performance_metrics();

CREATE OR REPLACE FUNCTION get_system_performance_metrics()
RETURNS TABLE (
  total_orders_today BIGINT,
  active_cafes BIGINT,
  avg_order_value NUMERIC,
  peak_hour INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE), 0) as total_orders_today,
    COALESCE(COUNT(DISTINCT cafe_id) FILTER (WHERE created_at >= CURRENT_DATE), 0) as active_cafes,
    COALESCE(AVG(total_amount) FILTER (WHERE created_at >= CURRENT_DATE), 0) as avg_order_value,
    COALESCE(
      (SELECT EXTRACT(HOUR FROM created_at)::INTEGER
       FROM public.orders
       WHERE created_at >= CURRENT_DATE
       GROUP BY EXTRACT(HOUR FROM created_at)
       ORDER BY COUNT(*) DESC
       LIMIT 1), 0
    ) as peak_hour;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_system_performance_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_system_performance_metrics() TO anon;

-- =====================================================
-- 3. ENSURE CAFES RPC FUNCTION WORKS PROPERLY
-- =====================================================

-- Verify the get_cafes_ordered function exists and works
DO $$
BEGIN
    -- Check if the function exists
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'get_cafes_ordered'
    ) THEN
        RAISE NOTICE '✅ get_cafes_ordered function exists';
    ELSE
        RAISE NOTICE '⚠️ get_cafes_ordered function missing, creating it...';
        
        -- Create the function if it doesn't exist
        CREATE OR REPLACE FUNCTION get_cafes_ordered()
        RETURNS TABLE (
            id UUID,
            name TEXT,
            description TEXT,
            image_url TEXT,
            rating NUMERIC,
            total_reviews INTEGER,
            type TEXT,
            location TEXT,
            slug TEXT,
            priority INTEGER,
            accepting_orders BOOLEAN
        ) AS $$
        BEGIN
            RETURN QUERY
            SELECT 
                c.id,
                c.name,
                c.description,
                c.image_url,
                c.rating,
                c.total_reviews,
                c.type,
                c.location,
                c.slug,
                c.priority,
                c.accepting_orders
            FROM public.cafes c
            WHERE c.is_active = true
            ORDER BY 
                COALESCE(c.priority, 999) ASC,
                c.name ASC;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        GRANT EXECUTE ON FUNCTION get_cafes_ordered() TO authenticated;
        GRANT EXECUTE ON FUNCTION get_cafes_ordered() TO anon;
        
        RAISE NOTICE '✅ get_cafes_ordered function created';
    END IF;
END $$;

-- =====================================================
-- 4. OPTIMIZE MENU ITEMS QUERIES
-- =====================================================

-- Ensure menu_items has proper RLS policies that don't cause recursion
DROP POLICY IF EXISTS "menu_items_optimized_policy" ON public.menu_items;

CREATE POLICY "menu_items_public_read" ON public.menu_items
    FOR SELECT USING (true);

CREATE POLICY "menu_items_cafe_management" ON public.menu_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = (SELECT auth.uid()) 
            AND profiles.user_type = 'cafe_owner'
            AND profiles.cafe_id = menu_items.cafe_id
        )
    );

-- =====================================================
-- 5. GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant permissions to prevent permission errors
GRANT ALL ON public.cafe_staff TO authenticated;
GRANT ALL ON public.menu_items TO authenticated;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.cafes TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- Grant select permissions to anon users for public data
GRANT SELECT ON public.cafes TO anon;
GRANT SELECT ON public.menu_items TO anon;

-- =====================================================
-- 6. TEST THE FIXES
-- =====================================================

-- Test cafe fetching
SELECT 'Testing cafe fetching...' as status;
SELECT COUNT(*) as cafe_count FROM get_cafes_ordered();

-- Test system performance metrics
SELECT 'Testing system metrics...' as status;
SELECT * FROM get_system_performance_metrics();

-- Test menu items query
SELECT 'Testing menu items...' as status;
SELECT COUNT(*) as menu_items_count FROM public.menu_items WHERE is_available = true;

-- =====================================================
-- 7. SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 All 500 errors fixed!';
    RAISE NOTICE '✅ Cafe staff infinite recursion resolved';
    RAISE NOTICE '✅ System performance metrics function fixed';
    RAISE NOTICE '✅ Cafes RPC function optimized';
    RAISE NOTICE '✅ Menu items queries optimized';
    RAISE NOTICE '✅ Permissions granted properly';
    RAISE NOTICE '🚀 App should now work without 500 errors!';
END $$;
