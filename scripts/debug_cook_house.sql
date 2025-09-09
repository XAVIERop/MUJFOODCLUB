-- Debug Cook House Configuration
-- This will help us understand why the WhatsApp function returns false

-- 1. Check if Cook House exists at all
SELECT 
  'Cook House Existence Check:' as check_type,
  COUNT(*) as cafe_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ Cook House not found'
    WHEN COUNT(*) = 1 THEN '✅ Cook House found'
    ELSE '⚠️ Multiple Cook House entries found'
  END as result
FROM public.cafes 
WHERE name ILIKE '%cook%house%' OR name ILIKE '%cookhouse%';

-- 2. Show all cafes with 'cook' in the name
SELECT 
  'All Cafes with COOK in name:' as check_type,
  id,
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  is_active,
  created_at
FROM public.cafes 
WHERE name ILIKE '%cook%'
ORDER BY name;

-- 3. Show all cafes with 'house' in the name
SELECT 
  'All Cafes with HOUSE in name:' as check_type,
  id,
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  is_active,
  created_at
FROM public.cafes 
WHERE name ILIKE '%house%'
ORDER BY name;

-- 4. Show all active cafes to see exact naming
SELECT 
  'All Active Cafes (first 10):' as check_type,
  id,
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  is_active
FROM public.cafes 
WHERE is_active = true
ORDER BY name
LIMIT 10;

-- 5. Check the exact cafe that the function is trying to use
SELECT 
  'Cafe being used by function:' as check_type,
  id,
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  is_active
FROM public.cafes 
WHERE name ILIKE '%cook%house%' OR name ILIKE '%cookhouse%'
LIMIT 1;
