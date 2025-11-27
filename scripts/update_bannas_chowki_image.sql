-- Update Banna's Chowki cafe image URL for cafe cards and menu pages
-- This image will be used in:
-- - Cafe cards on homepage (EnhancedCafeCard, HorizontalCafeCard, MobileCafeSlideList)
-- - Menu page header (ModernMenuLayout, SwiggyStyleHero)

UPDATE public.cafes
SET image_url = 'https://ik.imagekit.io/foodclub/Cafe/Banna''s%20Chowki/PHOTO-2025-11-23-19-46-23.jpg'
WHERE LOWER(name) LIKE '%banna%' AND LOWER(name) LIKE '%chowki%';

-- Verify the update
SELECT 
  id,
  name,
  image_url,
  is_active,
  location_scope
FROM public.cafes
WHERE LOWER(name) LIKE '%banna%' AND LOWER(name) LIKE '%chowki%'
ORDER BY name;

SELECT 'Banna''s Chowki image URL updated successfully!' as status;

