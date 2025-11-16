-- Add Banna's Chowki as an off-campus cafe
INSERT INTO public.cafes (
  name,
  slug,
  type,
  description,
  location,
  phone,
  hours,
  image_url,
  rating,
  total_reviews,
  accepting_orders,
  priority,
  location_scope
)
VALUES (
  'Banna''s Chowki',
  'bannas-chowki',
  'North Indian & Tandoor',
  'Late-night tandoori, rolls, and hearty mains delivered right to campus gates.',
  'Koko''Ro Lane, Near Kumawat Hostel, Manipal Road',
  '+91 98765 40123',
  '4:00 PM - 2:00 AM',
  'https://ik.imagekit.io/foodclub/Cafe/Banna''s%20Chowki/IMG_0390.jpg?updatedAt=1762687682948',
  4.6,
  112,
  true,
  25,
  'off_campus'
)
ON CONFLICT (slug) DO UPDATE
SET
  type = EXCLUDED.type,
  description = EXCLUDED.description,
  location = EXCLUDED.location,
  phone = EXCLUDED.phone,
  hours = EXCLUDED.hours,
  image_url = EXCLUDED.image_url,
  rating = EXCLUDED.rating,
  total_reviews = EXCLUDED.total_reviews,
  accepting_orders = EXCLUDED.accepting_orders,
  priority = EXCLUDED.priority,
  location_scope = EXCLUDED.location_scope;

-- Ensure the cafe is active
UPDATE public.cafes
SET is_active = true
WHERE slug = 'bannas-chowki';

