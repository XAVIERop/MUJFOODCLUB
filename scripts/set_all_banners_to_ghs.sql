-- Set all current promotional banners to GHS scope
-- This ensures only @muj.manipal.edu and @mujfoodclub.in users see them

-- Update all existing banners to 'ghs'
UPDATE public.promotional_banners
SET location_scope = 'ghs';

-- Verify the update
SELECT 
  COUNT(*) as total_banners,
  COUNT(*) FILTER (WHERE location_scope = 'ghs') as ghs_banners,
  COUNT(*) FILTER (WHERE location_scope = 'off_campus') as off_campus_banners,
  COUNT(*) FILTER (WHERE location_scope = 'all') as all_banners
FROM public.promotional_banners;

-- Show all banners with their scope
SELECT 
  id,
  title,
  location_scope,
  is_active,
  cafe_id,
  created_at
FROM public.promotional_banners
ORDER BY created_at DESC;

SELECT 'All banners updated to GHS scope successfully!' as status;

