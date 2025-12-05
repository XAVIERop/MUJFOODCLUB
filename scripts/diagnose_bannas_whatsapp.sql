-- Comprehensive diagnostic for Banna's Chowki WhatsApp notifications
-- Run this to check all configuration

-- 1. Check Banna's Chowki WhatsApp settings
SELECT 
  '🔍 BANNA''S CHOWKI CONFIGURATION' as section,
  id,
  name,
  slug,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  phone as regular_phone,
  CASE 
    WHEN whatsapp_enabled AND whatsapp_notifications AND whatsapp_phone IS NOT NULL 
    THEN '✅ Ready for WhatsApp notifications'
    WHEN whatsapp_phone IS NULL
    THEN '❌ No WhatsApp phone number configured'
    WHEN NOT whatsapp_enabled
    THEN '❌ WhatsApp disabled'
    WHEN NOT whatsapp_notifications
    THEN '❌ WhatsApp notifications disabled'
    ELSE '❌ Needs configuration'
  END as status
FROM public.cafes 
WHERE name ILIKE '%banna%chowki%'
   OR slug ILIKE '%banna%chowki%'
   OR slug = 'bannas-chowki'
ORDER BY name;

-- 2. Check recent orders for Banna's Chowki
SELECT 
  '📦 RECENT ORDERS' as section,
  o.id,
  o.order_number,
  o.created_at,
  o.status,
  o.total_amount,
  c.name as cafe_name
FROM public.orders o
JOIN public.cafes c ON o.cafe_id = c.id
WHERE c.name ILIKE '%banna%chowki%'
   OR c.slug ILIKE '%banna%chowki%'
ORDER BY o.created_at DESC
LIMIT 5;

-- 3. Summary
SELECT 
  '📊 SUMMARY' as section,
  COUNT(*) FILTER (WHERE whatsapp_enabled = true AND whatsapp_notifications = true AND whatsapp_phone IS NOT NULL) as cafes_ready_for_whatsapp,
  COUNT(*) FILTER (WHERE name ILIKE '%banna%chowki%') as bannas_chowki_count
FROM public.cafes;

