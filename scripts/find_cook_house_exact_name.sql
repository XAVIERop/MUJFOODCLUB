-- Find the exact name of Cook House cafe
-- This will help us identify any case sensitivity or naming issues

-- 1. Search for all cafes with 'cook' in the name
SELECT 
  'Cafes with COOK in name:' as search_type,
  id,
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  is_active
FROM public.cafes 
WHERE name ILIKE '%cook%'
ORDER BY name;

-- 2. Search for all cafes with 'house' in the name
SELECT 
  'Cafes with HOUSE in name:' as search_type,
  id,
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  is_active
FROM public.cafes 
WHERE name ILIKE '%house%'
ORDER BY name;

-- 3. Show all active cafes to see the exact naming
SELECT 
  'All Active Cafes:' as search_type,
  id,
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  is_active
FROM public.cafes 
WHERE is_active = true
ORDER BY name;

-- 4. Count total cafes
SELECT 
  'Total Cafes Count:' as info,
  COUNT(*) as total_cafes,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_cafes,
  COUNT(CASE WHEN whatsapp_enabled = true THEN 1 END) as whatsapp_enabled_cafes,
  COUNT(CASE WHEN whatsapp_phone IS NOT NULL THEN 1 END) as cafes_with_phone
FROM public.cafes;
