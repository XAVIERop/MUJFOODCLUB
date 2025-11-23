-- First, check the exact cafe names in the database
SELECT 
  id,
  name,
  image_url,
  is_active,
  location_scope
FROM public.cafes
WHERE 
  LOWER(name) LIKE '%amor%' OR
  LOWER(name) LIKE '%koko%ro%' OR
  LOWER(name) LIKE '%banna%chowki%' OR
  LOWER(name) LIKE '%bg%food%cart%' OR
  LOWER(name) LIKE '%food%cart%'
ORDER BY name;

-- Update with exact names (case-sensitive)
-- Run these one by one and check which ones match

-- Try Amor
UPDATE public.cafes
SET image_url = 'https://ik.imagekit.io/foodclub/Cafe/Amor/IMG_8270.JPG?updatedAt=1762946988471'
WHERE LOWER(name) LIKE '%amor%'
AND LOWER(name) NOT LIKE '%havmor%'; -- Exclude Havmor

-- Try BG The Food Cart
UPDATE public.cafes
SET image_url = 'https://ik.imagekit.io/foodclub/Cafe/Food%20Cart/Food%20Cart.jpg?updatedAt=1763167203799'
WHERE (LOWER(name) LIKE '%bg%' AND LOWER(name) LIKE '%food%cart%')
OR LOWER(name) = 'bg the food cart';

-- Try Banna's Chowki
UPDATE public.cafes
SET image_url = 'https://ik.imagekit.io/foodclub/Cafe/Banna''s%20Chowki/Banna.jpg?updatedAt=1763167090456'
WHERE LOWER(name) LIKE '%banna%' AND LOWER(name) LIKE '%chowki%';

-- Try Koko'ro
UPDATE public.cafes
SET image_url = 'https://ik.imagekit.io/foodclub/Cafe/Koko''ro/Koko''ro.jpeg?updatedAt=1763167147690'
WHERE LOWER(name) LIKE '%koko%ro%' OR LOWER(name) LIKE '%kokoro%';

-- Verify all updates
SELECT 
  name,
  image_url,
  CASE 
    WHEN image_url IS NOT NULL THEN '✅ Has image'
    ELSE '❌ No image'
  END as status
FROM public.cafes
WHERE 
  LOWER(name) LIKE '%amor%' OR
  LOWER(name) LIKE '%koko%ro%' OR
  LOWER(name) LIKE '%banna%chowki%' OR
  (LOWER(name) LIKE '%bg%' AND LOWER(name) LIKE '%food%cart%')
ORDER BY name;

