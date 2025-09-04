-- Complete Fix for Cafe Priority System
-- Run this script to fix the priority ordering

-- Step 1: Set the correct priorities for featured cafes
UPDATE public.cafes SET priority = 1 WHERE name ILIKE '%chatkara%';
UPDATE public.cafes SET priority = 2 WHERE name ILIKE '%food court%';

-- Step 2: Set default priority for all other cafes
UPDATE public.cafes SET priority = 999 WHERE priority IS NULL OR (priority != 1 AND priority != 2);

-- Step 3: Create or replace the ordering function
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

-- Step 4: Grant execute permissions
GRANT EXECUTE ON FUNCTION get_cafes_ordered() TO authenticated;
GRANT EXECUTE ON FUNCTION get_cafes_ordered() TO anon;

-- Step 5: Verify the fix
SELECT 
    name,
    priority,
    average_rating,
    total_ratings
FROM public.cafes 
ORDER BY priority, average_rating DESC NULLS LAST, name
LIMIT 10;

-- Step 6: Test the function
SELECT 
    name,
    priority,
    average_rating,
    total_ratings
FROM get_cafes_ordered() 
LIMIT 5;
