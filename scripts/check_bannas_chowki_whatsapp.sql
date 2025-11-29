-- Check Banna's Chowki WhatsApp Configuration
-- Run this in Supabase SQL Editor to see current settings

SELECT 
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
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
WHERE name ILIKE '%banna%' OR slug = 'bannas-chowki';

