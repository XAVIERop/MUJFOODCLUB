-- Fix Cafe Data Structure Mismatch
-- This script fixes the mismatch between frontend expectations and database schema

-- =====================================================
-- 1. ADD MISSING COLUMNS TO CAFES TABLE
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

    -- Add phone column if it doesn't exist (it should exist but let's be safe)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cafes' AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.cafes ADD COLUMN phone TEXT DEFAULT '+91-0000000000';
    END IF;

    -- Add hours column if it doesn't exist (it should exist but let's be safe)
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
-- 2. UPDATE EXISTING CAFES WITH PROPER DATA
-- =====================================================

-- Update existing cafes with proper slugs and priorities
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
        ELSE LOWER(REPLACE(REPLACE(name, ' ', '-'), '&', 'and'))
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
-- 3. FIX THE RPC FUNCTION TO MATCH ACTUAL SCHEMA
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
-- 4. TEST THE FIXED FUNCTION
-- =====================================================

-- Test the function
SELECT 'Testing fixed get_cafes_ordered function...' as status;
SELECT COUNT(*) as cafe_count FROM get_cafes_ordered();

-- Show sample data
SELECT 'Sample cafe data:' as status;
SELECT name, slug, priority, accepting_orders, average_rating, total_ratings 
FROM get_cafes_ordered() 
LIMIT 5;

-- =====================================================
-- 5. SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 Cafe data structure mismatch fixed!';
    RAISE NOTICE '✅ Added missing columns: slug, priority, phone, hours, etc.';
    RAISE NOTICE '✅ Updated existing cafes with proper data';
    RAISE NOTICE '✅ Fixed RPC function to match actual schema';
    RAISE NOTICE '✅ Cafes should now load properly in frontend';
    RAISE NOTICE '🚀 Navigation to cafe menus should work correctly!';
END $$;
