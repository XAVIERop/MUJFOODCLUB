-- WhatsApp Configuration Status Summary
-- Shows which cafes are ready and which need setup

SELECT 
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  CASE 
    WHEN whatsapp_enabled AND whatsapp_notifications AND whatsapp_phone IS NOT NULL 
    THEN '✅ Ready'
    ELSE '❌ Needs setup'
  END as status
FROM public.cafes 
WHERE is_active = true
ORDER BY 
  CASE 
    WHEN whatsapp_enabled AND whatsapp_notifications AND whatsapp_phone IS NOT NULL THEN 1
    ELSE 2
  END,
  name;

-- Summary counts
SELECT 
  COUNT(*) FILTER (WHERE whatsapp_enabled AND whatsapp_notifications AND whatsapp_phone IS NOT NULL) as ready_count,
  COUNT(*) FILTER (WHERE NOT (whatsapp_enabled AND whatsapp_notifications AND whatsapp_phone IS NOT NULL)) as needs_setup_count,
  COUNT(*) as total_active_cafes
FROM public.cafes 
WHERE is_active = true;

