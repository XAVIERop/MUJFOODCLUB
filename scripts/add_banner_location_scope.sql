-- Add location_scope to promotional_banners table
-- This allows filtering banners based on user residency (GHS vs Off-campus)

-- 1. Add location_scope column
ALTER TABLE public.promotional_banners 
ADD COLUMN IF NOT EXISTS location_scope TEXT DEFAULT 'ghs';

-- 2. Add constraint to ensure valid values
ALTER TABLE public.promotional_banners
ADD CONSTRAINT promotional_banners_location_scope_check 
CHECK (location_scope IN ('ghs', 'off_campus', 'all'));

-- 3. Update existing banners based on their cafe
-- Banners for off-campus cafes should be 'off_campus'
-- Banners with no cafe (global) should be 'all' by default
UPDATE public.promotional_banners
SET location_scope = CASE
  WHEN cafe_id IS NULL THEN 'all'  -- Global banners visible to everyone
  WHEN cafe_id IN (
    SELECT id FROM public.cafes 
    WHERE location_scope = 'off_campus'
  ) THEN 'off_campus'
  ELSE 'ghs'
END;

-- 4. Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_promotional_banners_location_scope 
ON public.promotional_banners(location_scope);

-- 5. Verify the changes
SELECT 
  COUNT(*) as total_banners,
  location_scope,
  COUNT(*) FILTER (WHERE is_active = true) as active_banners
FROM public.promotional_banners
GROUP BY location_scope;

-- 6. Show sample banners by scope
SELECT 
  id,
  title,
  location_scope,
  is_active,
  cafe_id
FROM public.promotional_banners
ORDER BY location_scope, priority DESC
LIMIT 10;

SELECT 'Banner location scope added successfully!' as status;

