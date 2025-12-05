-- Fix Banna's Chowki WhatsApp phone number
-- The logs show it's sending to 918383080140, but it should be the correct number

-- Update to use the Aisensy number (which forwards to Banna's owner)
UPDATE public.cafes 
SET 
  whatsapp_phone = '+919625851220',  -- Aisensy number
  whatsapp_enabled = true,
  whatsapp_notifications = true,
  updated_at = NOW()
WHERE name ILIKE '%banna%chowki%'
   OR slug ILIKE '%banna%chowki%'
   OR slug = 'bannas-chowki';

-- Verify the update
SELECT 
  '✅ VERIFICATION' as section,
  id,
  name,
  slug,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  phone as regular_phone,
  updated_at,
  CASE 
    WHEN whatsapp_phone = '+919625851220' 
     AND whatsapp_enabled = true 
     AND whatsapp_notifications = true
    THEN '✅ WhatsApp correctly configured'
    ELSE '❌ Configuration issue'
  END as status
FROM public.cafes 
WHERE name ILIKE '%banna%chowki%'
   OR slug ILIKE '%banna%chowki%'
   OR slug = 'bannas-chowki'
ORDER BY name;

