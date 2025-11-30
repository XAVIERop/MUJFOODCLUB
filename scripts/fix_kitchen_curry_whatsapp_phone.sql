-- Fix The Kitchen & Curry WhatsApp phone number (add country code)
UPDATE public.cafes 
SET 
  whatsapp_phone = '+91' || whatsapp_phone,
  updated_at = NOW()
WHERE name ILIKE '%kitchen%curry%' 
  AND whatsapp_phone IS NOT NULL
  AND whatsapp_phone NOT LIKE '+91%'
  AND whatsapp_phone NOT LIKE '91%';

-- Verify the fix
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
WHERE name ILIKE '%kitchen%curry%';

