-- Verify that cafe images were updated correctly
SELECT 
  name,
  image_url,
  is_active,
  location_scope
FROM public.cafes
WHERE name IN ('Amor', 'BG The Food Cart', 'Banna''s Chowki', 'Koko''ro')
ORDER BY name;

