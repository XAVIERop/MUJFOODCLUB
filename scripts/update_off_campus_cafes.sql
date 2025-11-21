-- Update cafes to off_campus based on their location
-- This script identifies cafes that are clearly outside GHS campus

-- Update cafes that are clearly off-campus based on location
UPDATE public.cafes 
SET location_scope = 'off_campus'
WHERE 
    -- Banna's Chowki - Koko'Ro Lane, Near Kumawat Hostel, Manipal Road
    (name ILIKE '%banna%chowki%' OR slug = 'bannas-chowki')
    OR
    -- Amor - Wild Garden, Jaipur
    (name ILIKE '%amor%' OR slug = 'amor')
    OR
    -- Koko'ro - Koko'Ro Lane, Near Kumawat Hostel, Manipal Road
    (name ILIKE '%koko%ro%' OR slug = 'kokoro')
    OR
    -- BG The Food Cart - Manipal University, Dahemi-Kalan (outside GHS)
    (name ILIKE '%bg%food%cart%' OR slug = 'bg-the-food-cart')
    OR
    -- Momos Cart - Manipal University, Dahemi-Kalan (outside GHS)
    (name ILIKE '%momos%cart%' OR slug = 'momoscart')
    OR
    -- Any cafe with location containing "Manipal Road" or "Koko'Ro" or "Wild Garden" or "Dahemi-Kalan"
    (location ILIKE '%manipal road%' 
     OR location ILIKE '%koko%ro%' 
     OR location ILIKE '%wild garden%'
     OR location ILIKE '%dahemi-kalan%'
     OR location ILIKE '%kumawat hostel%')
    OR
    -- Any cafe that doesn't have "GHS" in location (safety check)
    (location NOT ILIKE '%ghs%' AND location NOT ILIKE '%b1%' AND location NOT ILIKE '%b2%' 
     AND location NOT ILIKE '%b3%' AND location NOT ILIKE '%b4%' AND location NOT ILIKE '%b5%'
     AND location NOT ILIKE '%b6%' AND location NOT ILIKE '%b7%' AND location NOT ILIKE '%b8%'
     AND location NOT ILIKE '%b9%' AND location NOT ILIKE '%g1%' AND location NOT ILIKE '%g2%'
     AND location NOT ILIKE '%g3%' AND location NOT ILIKE '%g4%' AND location NOT ILIKE '%g5%'
     AND location NOT ILIKE '%g6%' AND location NOT ILIKE '%g7%' AND location NOT ILIKE '%g8%');

-- Verify the updates
SELECT 
    name,
    slug,
    location_scope,
    location
FROM public.cafes
WHERE location_scope = 'off_campus'
ORDER BY name;

-- Show summary
SELECT 
    location_scope,
    COUNT(*) as cafe_count
FROM public.cafes
GROUP BY location_scope;


