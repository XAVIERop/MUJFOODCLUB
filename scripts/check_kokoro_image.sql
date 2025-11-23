-- Check Koko'ro cafe specifically by ID
SELECT 
  id,
  name,
  image_url,
  is_active,
  location_scope
FROM public.cafes
WHERE id = '4813591c-eb9e-4664-81a5-9237c8cc978e';

-- Also check by name variations
SELECT 
  id,
  name,
  image_url,
  is_active
FROM public.cafes
WHERE 
  LOWER(name) LIKE '%koko%ro%' OR
  LOWER(name) LIKE '%kokoro%'
ORDER BY name;

-- Update Koko'ro by ID (most reliable)
UPDATE public.cafes
SET image_url = 'https://ik.imagekit.io/foodclub/Cafe/Koko''ro/Koko''ro.jpeg?updatedAt=1763167147690'
WHERE id = '4813591c-eb9e-4664-81a5-9237c8cc978e';

-- Verify the update
SELECT 
  id,
  name,
  image_url,
  CASE 
    WHEN image_url IS NOT NULL THEN '✅ Has image'
    ELSE '❌ No image'
  END as status
FROM public.cafes
WHERE id = '4813591c-eb9e-4664-81a5-9237c8cc978e';

