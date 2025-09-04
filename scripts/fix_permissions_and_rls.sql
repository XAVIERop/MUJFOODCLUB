-- Fix RLS Policies and Permissions for Cafe Priority System
-- This will resolve the 406 errors and ensure the function works from frontend

-- 1. Drop existing problematic policies on cafe_staff
DROP POLICY IF EXISTS "cafe_staff_can_manage_queue" ON public.order_queue;
DROP POLICY IF EXISTS "cafe_staff_can_view_queue" ON public.order_queue;
DROP POLICY IF EXISTS "cafe_staff_can_update_queue" ON public.order_queue;

-- 2. Fix cafe_staff table permissions
DROP POLICY IF EXISTS "cafe_staff_can_view_own" ON public.cafe_staff;
DROP POLICY IF EXISTS "cafe_staff_can_update_own" ON public.cafe_staff;

-- 3. Create simple, permissive policies for cafe_staff
CREATE POLICY "cafe_staff_public_read" ON public.cafe_staff
  FOR SELECT USING (true);

CREATE POLICY "cafe_staff_authenticated_update" ON public.cafe_staff
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. Ensure the get_cafes_ordered function has proper permissions
DROP FUNCTION IF EXISTS get_cafes_ordered();

-- 5. Recreate the function with SECURITY DEFINER and proper permissions
CREATE OR REPLACE FUNCTION get_cafes_ordered()
RETURNS TABLE (
    id UUID,
    name TEXT,
    type TEXT,
    description TEXT,
    location TEXT,
    phone TEXT,
    hours TEXT,
    image_url TEXT,
    rating DECIMAL(2,1),
    total_reviews INTEGER,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    average_rating DECIMAL(3,2),
    total_ratings INTEGER,
    cuisine_categories TEXT[],
    accepting_orders BOOLEAN,
    priority INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.type,
        c.description,
        c.location,
        c.phone,
        c.hours,
        c.image_url,
        c.rating,
        c.total_reviews,
        c.is_active,
        c.created_at,
        c.updated_at,
        c.average_rating,
        c.total_ratings,
        c.cuisine_categories,
        c.accepting_orders,
        c.priority
    FROM public.cafes c
    WHERE c.is_active = true
    ORDER BY 
        c.priority ASC,  -- Featured cafes first (1, 2, 3...)
        c.average_rating DESC NULLS LAST,  -- Then by rating
        c.total_ratings DESC NULLS LAST,   -- Then by number of ratings
        c.name ASC;                        -- Finally alphabetically
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant execute permissions to all users
GRANT EXECUTE ON FUNCTION get_cafes_ordered() TO authenticated;
GRANT EXECUTE ON FUNCTION get_cafes_ordered() TO anon;

-- 7. Ensure cafes table has proper read permissions
DROP POLICY IF EXISTS "Anyone can view active cafes" ON public.cafes;
CREATE POLICY "Anyone can view active cafes" ON public.cafes
  FOR SELECT USING (is_active = true);

-- 8. Test the function
SELECT 'Testing function...' as status;
SELECT name, priority, average_rating 
FROM get_cafes_ordered() 
LIMIT 5;

-- 9. Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Permissions and RLS policies fixed successfully!';
    RAISE NOTICE '✅ get_cafes_ordered() function should now work from frontend';
    RAISE NOTICE '✅ 406 errors should be resolved';
END $$;
