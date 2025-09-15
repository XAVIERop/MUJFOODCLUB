-- Complete Cafe Navigation Fix
-- This script fixes all issues preventing cafe navigation from working

-- =====================================================
-- 1. FIX CAFE_STAFF INFINITE RECURSION (if not already fixed)
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
-- 2. ADD ALL MISSING COLUMNS TO CAFES TABLE
-- =====================================================

-- Add missing columns to cafes table
DO $$
BEGIN
    -- Add slug column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cafes' AND column_name = 'slug'
    ) THEN
        ALTER TABLE public.cafes ADD COLUMN slug TEXT;
    END IF;

    -- Add priority column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cafes' AND column_name = 'priority'
    ) THEN
        ALTER TABLE public.cafes ADD COLUMN priority INTEGER DEFAULT 999;
    END IF;

    -- Add phone column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cafes' AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.cafes ADD COLUMN phone TEXT DEFAULT '+91-0000000000';
    END IF;

    -- Add hours column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cafes' AND column_name = 'hours'
    ) THEN
        ALTER TABLE public.cafes ADD COLUMN hours TEXT DEFAULT '11:00 AM - 2:00 AM';
    END IF;

    -- Add accepting_orders column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cafes' AND column_name = 'accepting_orders'
    ) THEN
        ALTER TABLE public.cafes ADD COLUMN accepting_orders BOOLEAN DEFAULT true;
    END IF;

    -- Add average_rating column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cafes' AND column_name = 'average_rating'
    ) THEN
        ALTER TABLE public.cafes ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0.00;
    END IF;

    -- Add total_ratings column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cafes' AND column_name = 'total_ratings'
    ) THEN
        ALTER TABLE public.cafes ADD COLUMN total_ratings INTEGER DEFAULT 0;
    END IF;

    -- Add cuisine_categories column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cafes' AND column_name = 'cuisine_categories'
    ) THEN
        ALTER TABLE public.cafes ADD COLUMN cuisine_categories TEXT[] DEFAULT ARRAY['Multi-Cuisine'];
    END IF;

    RAISE NOTICE 'Cafe columns checked and added if needed.';
END $$;

-- =====================================================
-- 3. UPDATE EXISTING CAFES WITH PROPER DATA
-- =====================================================

-- Update existing cafes with proper slugs, priorities, and other data
UPDATE public.cafes 
SET 
    slug = CASE 
        WHEN name = 'CHATKARA' THEN 'chatkara'
        WHEN name = 'FOOD COURT' THEN 'food-court'
        WHEN name = 'Mini Meals' THEN 'mini-meals'
        WHEN name = 'Punjabi Tadka' THEN 'punjabi-tadka'
        WHEN name = 'Munch Box' THEN 'munch-box'
        WHEN name = 'COOK HOUSE' THEN 'cook-house'
        WHEN name = 'China Town' THEN 'china-town'
        WHEN name = 'Dev Sweets & Snacks' THEN 'dev-sweets-snacks'
        WHEN name = 'Dialog' THEN 'dialog'
        WHEN name = 'Havmor' THEN 'havmor'
        WHEN name = 'ITALIAN OVEN' THEN 'italian-oven'
        WHEN name = 'Let''s Go Live' THEN 'lets-go-live'
        WHEN name = 'Soya Chaap Corner' THEN 'soya-chaap-corner'
        WHEN name = 'STARDOM Café & Lounge' THEN 'stardom-cafe-lounge'
        WHEN name = 'Taste of India' THEN 'taste-of-india'
        WHEN name = 'Tea Tradition' THEN 'tea-tradition'
        WHEN name = 'The Crazy Chef' THEN 'the-crazy-chef'
        WHEN name = 'The Kitchen & Curry' THEN 'the-kitchen-curry'
        WHEN name = 'Waffle Fit N Fresh' THEN 'waffle-fit-n-fresh'
        WHEN name = 'ZAIKA' THEN 'zaika'
        WHEN name = 'ZERO DEGREE CAFE' THEN 'zero-degree-cafe'
        ELSE LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), '&', 'and'), '''', ''))
    END,
    priority = CASE 
        WHEN name = 'CHATKARA' THEN 1
        WHEN name = 'FOOD COURT' THEN 2
        WHEN name = 'Mini Meals' THEN 3
        WHEN name = 'Punjabi Tadka' THEN 4
        WHEN name = 'Munch Box' THEN 5
        WHEN name = 'COOK HOUSE' THEN 6
        WHEN name = 'China Town' THEN 7
        WHEN name = 'Dev Sweets & Snacks' THEN 8
        WHEN name = 'Dialog' THEN 9
        WHEN name = 'Havmor' THEN 10
        WHEN name = 'ITALIAN OVEN' THEN 11
        WHEN name = 'Let''s Go Live' THEN 12
        WHEN name = 'Soya Chaap Corner' THEN 13
        WHEN name = 'STARDOM Café & Lounge' THEN 14
        WHEN name = 'Taste of India' THEN 15
        WHEN name = 'Tea Tradition' THEN 16
        WHEN name = 'The Crazy Chef' THEN 17
        WHEN name = 'The Kitchen & Curry' THEN 18
        WHEN name = 'Waffle Fit N Fresh' THEN 19
        WHEN name = 'ZAIKA' THEN 20
        WHEN name = 'ZERO DEGREE CAFE' THEN 21
        ELSE 999
    END,
    accepting_orders = COALESCE(accepting_orders, true),
    average_rating = COALESCE(average_rating, COALESCE(rating, 0.00)),
    total_ratings = COALESCE(total_ratings, COALESCE(total_reviews, 0)),
    cuisine_categories = COALESCE(cuisine_categories, ARRAY['Multi-Cuisine']),
    phone = COALESCE(phone, '+91-0000000000'),
    hours = COALESCE(hours, '11:00 AM - 2:00 AM')
WHERE slug IS NULL OR priority IS NULL OR accepting_orders IS NULL 
   OR average_rating IS NULL OR total_ratings IS NULL 
   OR cuisine_categories IS NULL OR phone IS NULL OR hours IS NULL;

-- =====================================================
-- 4. FIX THE RPC FUNCTION TO MATCH ACTUAL SCHEMA
-- =====================================================

-- Drop and recreate the get_cafes_ordered function with correct column mapping
DROP FUNCTION IF EXISTS get_cafes_ordered();

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
    accepting_orders BOOLEAN,
    phone TEXT,
    hours TEXT,
    average_rating DECIMAL(3,2),
    total_ratings INTEGER,
    cuisine_categories TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.description,
        c.image_url,
        COALESCE(c.rating, 0.00) as rating,
        COALESCE(c.total_reviews, 0) as total_reviews,
        c.type,
        c.location,
        c.slug,
        COALESCE(c.priority, 999) as priority,
        COALESCE(c.accepting_orders, true) as accepting_orders,
        COALESCE(c.phone, '+91-0000000000') as phone,
        COALESCE(c.hours, '11:00 AM - 2:00 AM') as hours,
        COALESCE(c.average_rating, COALESCE(c.rating, 0.00)) as average_rating,
        COALESCE(c.total_ratings, COALESCE(c.total_reviews, 0)) as total_ratings,
        COALESCE(c.cuisine_categories, ARRAY['Multi-Cuisine']) as cuisine_categories
    FROM public.cafes c
    WHERE c.is_active = true
    ORDER BY 
        COALESCE(c.priority, 999) ASC,
        c.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_cafes_ordered() TO authenticated;
GRANT EXECUTE ON FUNCTION get_cafes_ordered() TO anon;

-- =====================================================
-- 5. FIX SYSTEM PERFORMANCE METRICS FUNCTION
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
-- 6. OPTIMIZE MENU ITEMS QUERIES
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
-- 7. GRANT NECESSARY PERMISSIONS
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
-- 8. TEST THE FIXES
-- =====================================================

-- Test cafe fetching
SELECT 'Testing cafe fetching...' as status;
SELECT COUNT(*) as cafe_count FROM get_cafes_ordered();

-- Test specific cafe lookup by slug
SELECT 'Testing cafe lookup by slug...' as status;
SELECT id, name, slug FROM public.cafes WHERE slug = 'chatkara';

-- Test system performance metrics
SELECT 'Testing system metrics...' as status;
SELECT * FROM get_system_performance_metrics();

-- Test menu items query
SELECT 'Testing menu items...' as status;
SELECT COUNT(*) as menu_items_count FROM public.menu_items WHERE is_available = true;

-- Show sample cafe data
SELECT 'Sample cafe data:' as status;
SELECT name, slug, priority, accepting_orders, average_rating, total_ratings 
FROM get_cafes_ordered() 
LIMIT 5;

-- =====================================================
-- 9. SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 Complete cafe navigation fix applied!';
    RAISE NOTICE '✅ Fixed infinite recursion in cafe_staff policies';
    RAISE NOTICE '✅ Added all missing columns to cafes table';
    RAISE NOTICE '✅ Updated cafes with proper slugs and priorities';
    RAISE NOTICE '✅ Fixed RPC function to match actual schema';
    RAISE NOTICE '✅ Fixed system performance metrics function';
    RAISE NOTICE '✅ Optimized menu items queries';
    RAISE NOTICE '✅ Granted all necessary permissions';
    RAISE NOTICE '🚀 Cafe navigation should now work perfectly!';
    RAISE NOTICE '🚀 Clicking on cafes should open their menus correctly!';
END $$;
