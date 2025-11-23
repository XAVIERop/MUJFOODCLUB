-- Update get_cafes_ordered function to include location_scope
-- This is critical for residency-based filtering

-- Ensure the cafe_scope enum type exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cafe_scope') THEN
    CREATE TYPE cafe_scope AS ENUM ('ghs', 'off_campus');
  END IF;
END$$;

-- Drop the existing function first (required when changing return type)
DROP FUNCTION IF EXISTS get_cafes_ordered();

-- Recreate with location_scope included
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
    priority INTEGER,
    menu_pdf_url TEXT,
    location_scope cafe_scope
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
        c.priority,
        c.menu_pdf_url,
        COALESCE(c.location_scope, 'ghs'::cafe_scope) as location_scope
    FROM public.cafes c
    WHERE c.is_active = true
    ORDER BY 
        COALESCE(c.priority, 999) ASC,
        COALESCE(c.average_rating, 0) DESC,
        c.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_cafes_ordered() TO authenticated;
GRANT EXECUTE ON FUNCTION get_cafes_ordered() TO anon;

-- Verify the update
SELECT 'get_cafes_ordered function updated with location_scope!' as status;

-- Test: Show off-campus cafes
SELECT 
    name,
    location_scope,
    accepting_orders
FROM get_cafes_ordered()
WHERE location_scope = 'off_campus'
ORDER BY name;

