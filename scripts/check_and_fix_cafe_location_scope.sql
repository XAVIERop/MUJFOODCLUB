-- Check if location_scope column exists in cafes table
-- If it doesn't exist, we need to add it
-- If it exists but cafes don't have values, we need to update them

-- Step 1: Check if column exists (run this first to see if column exists)
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'cafes' 
AND column_name = 'location_scope';

-- Step 2: If column doesn't exist, add it
ALTER TABLE public.cafes
ADD COLUMN IF NOT EXISTS location_scope TEXT DEFAULT 'ghs';

-- Step 3: Add constraint
ALTER TABLE public.cafes
ADD CONSTRAINT cafes_location_scope_check 
CHECK (location_scope IN ('ghs', 'off_campus'));

-- Step 4: Set location_scope for cafes based on known off-campus cafes
-- Update known off-campus cafes
UPDATE public.cafes
SET location_scope = 'off_campus'
WHERE (
  LOWER(name) LIKE '%banna%' OR
  LOWER(name) LIKE '%chowki%' OR
  LOWER(name) LIKE '%amor%' OR
  LOWER(name) LIKE '%koko%ro%' OR
  LOWER(name) LIKE '%bg%' OR
  LOWER(name) LIKE '%food cart%'
) AND (location_scope IS NULL OR location_scope = 'ghs');

-- Step 5: Ensure all cafes have location_scope set (default to GHS if null)
UPDATE public.cafes
SET location_scope = 'ghs'
WHERE location_scope IS NULL;

-- Step 6: Create index
CREATE INDEX IF NOT EXISTS idx_cafes_location_scope 
ON public.cafes(location_scope);

-- Step 7: Verify the update
SELECT 
  location_scope,
  COUNT(*) as cafe_count,
  STRING_AGG(name, ', ' ORDER BY name) as cafe_names
FROM public.cafes
WHERE is_active = true
GROUP BY location_scope
ORDER BY location_scope;

-- Show all cafes with their location_scope
SELECT 
  id,
  name,
  location_scope,
  is_active,
  accepting_orders
FROM public.cafes
ORDER BY location_scope NULLS LAST, name;

SELECT 'Cafe location_scope column checked/updated successfully!' as status;

