-- Update phone number for Banna's Chowki
UPDATE public.cafes 
SET 
  phone = '+91 6350085552',
  updated_at = NOW()
WHERE 
  name ILIKE '%banna%chowki%'
  OR slug = 'bannaschowki'
  OR slug ILIKE '%banna%chowki%';

-- Verify the update
SELECT 
  id,
  name,
  slug,
  phone,
  updated_at,
  CASE 
    WHEN phone = '+91 6350085552' THEN '✅ Phone updated successfully'
    ELSE '❌ Phone not updated'
  END as status
FROM public.cafes 
WHERE 
  name ILIKE '%banna%chowki%'
  OR slug = 'bannaschowki'
  OR slug ILIKE '%banna%chowki%'
ORDER BY name;

