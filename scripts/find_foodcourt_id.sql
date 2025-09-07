-- Find Food Court Cafe ID for testing
SELECT 
  id,
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  CASE 
    WHEN whatsapp_enabled AND whatsapp_notifications AND whatsapp_phone IS NOT NULL 
    THEN '✅ Ready for WhatsApp notifications'
    ELSE '❌ Needs configuration'
  END as status
FROM public.cafes 
WHERE name = 'Food Court';
