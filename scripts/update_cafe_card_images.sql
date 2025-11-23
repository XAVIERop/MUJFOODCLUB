-- Update cafe card images (large featured images, not logos)
-- These images will appear in cafe cards, menu headers, and featured sections
-- Note: Small circular icons/logos are handled separately

UPDATE public.cafes
SET image_url = 'https://ik.imagekit.io/foodclub/Cafe/Amor/IMG_8270.JPG?updatedAt=1762946988471'
WHERE name = 'Amor';

UPDATE public.cafes
SET image_url = 'https://ik.imagekit.io/foodclub/Cafe/Food%20Cart/Food%20Cart.jpg?updatedAt=1763167203799'
WHERE name = 'BG The Food Cart';

UPDATE public.cafes
SET image_url = 'https://ik.imagekit.io/foodclub/Cafe/Banna''s%20Chowki/Banna.jpg?updatedAt=1763167090456'
WHERE name = 'Banna''s Chowki';

UPDATE public.cafes
SET image_url = 'https://ik.imagekit.io/foodclub/Cafe/Koko''ro/Koko''ro.jpeg?updatedAt=1763167147690'
WHERE name = 'Koko''ro';

-- Verify the updates
SELECT 
  name,
  image_url,
  is_active,
  location_scope
FROM public.cafes
WHERE name IN ('Amor', 'BG The Food Cart', 'Banna''s Chowki', 'Koko''ro')
ORDER BY name;

SELECT 'Cafe card images updated successfully! These will appear in cafe cards, menu headers, and featured sections.' as status;

