-- Check all cafe names to find the exact Food Court name
SELECT 
  id,
  name,
  LOWER(name) as lower_name,
  UPPER(name) as upper_name,
  TRIM(name) as trimmed_name,
  LENGTH(name) as name_length,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications
FROM public.cafes 
ORDER BY name;

-- Also check for any cafes with "food" or "court" in the name
SELECT 
  id,
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications
FROM public.cafes 
WHERE LOWER(name) LIKE '%food%' 
   OR LOWER(name) LIKE '%court%'
   OR LOWER(name) LIKE '%foodcourt%'
   OR LOWER(name) LIKE '%food-court%'
   OR LOWER(name) LIKE '%food_court%';
