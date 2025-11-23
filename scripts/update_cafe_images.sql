-- Update cafe images/logos in the slider
-- Simply update the image_url column for each cafe

-- Example: Update a single cafe's image
UPDATE public.cafes
SET image_url = 'https://your-image-url-here.com/cafe-logo.jpg'
WHERE name = 'Amor';

-- Example: Update multiple cafes at once
UPDATE public.cafes
SET image_url = CASE
  WHEN name = 'Amor' THEN 'https://ik.imagekit.io/foodclub/Cafe/Amor/amor-logo.jpg'
  WHEN name = 'Banna''s Chowki' THEN 'https://ik.imagekit.io/foodclub/Cafe/Banna''s%20Chowki/banna-logo.jpg'
  WHEN name = 'Koko''ro' THEN 'https://ik.imagekit.io/foodclub/Cafe/Koko''ro/kokoro-logo.jpg'
  WHEN name = 'BG The Food Cart' THEN 'https://ik.imagekit.io/foodclub/Cafe/Food%20Cart/foodcart-logo.jpg'
  -- Add more cafes as needed
END
WHERE name IN ('Amor', 'Banna''s Chowki', 'Koko''ro', 'BG The Food Cart');

-- Verify the updates
SELECT 
  name,
  image_url,
  is_active
FROM public.cafes
WHERE name IN ('Amor', 'Banna''s Chowki', 'Koko''ro', 'BG The Food Cart')
ORDER BY name;

-- To see all cafes and their current image URLs
SELECT 
  id,
  name,
  image_url,
  is_active,
  location_scope
FROM public.cafes
WHERE is_active = true
ORDER BY name;

