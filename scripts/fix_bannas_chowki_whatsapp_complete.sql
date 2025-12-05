-- Complete fix for Banna's Chowki WhatsApp notifications
-- This updates the WhatsApp phone number to the correct Aisensy number

-- Step 1: Update WhatsApp phone number
UPDATE public.cafes 
SET 
  whatsapp_phone = '+919625851220',  -- Aisensy number (correct)
  whatsapp_enabled = true,
  whatsapp_notifications = true,
  updated_at = NOW()
WHERE name ILIKE '%banna%chowki%'
   OR slug ILIKE '%banna%chowki%'
   OR slug = 'bannas-chowki';

-- Step 2: Verify configuration
SELECT 
  '✅ CONFIGURATION CHECK' as section,
  id,
  name,
  slug,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  phone as regular_phone,
  CASE 
    WHEN whatsapp_phone = '+919625851220' 
     AND whatsapp_enabled = true 
     AND whatsapp_notifications = true
    THEN '✅ Ready for WhatsApp notifications'
    WHEN whatsapp_phone IS NULL
    THEN '❌ No WhatsApp phone number'
    WHEN whatsapp_phone != '+919625851220'
    THEN '⚠️ Wrong phone number: ' || whatsapp_phone
    ELSE '❌ Configuration issue'
  END as status
FROM public.cafes 
WHERE name ILIKE '%banna%chowki%'
   OR slug ILIKE '%banna%chowki%'
   OR slug = 'bannas-chowki'
ORDER BY name;

