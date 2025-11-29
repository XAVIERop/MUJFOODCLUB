-- Set Banna's Chowki WhatsApp Configuration
-- This will send WhatsApp notifications to the specified phone number when orders are placed

UPDATE public.cafes 
SET 
  whatsapp_phone = '+919625851220',  -- Aisensy number or Banna's owner number
  whatsapp_enabled = true,
  whatsapp_notifications = true,
  updated_at = NOW()
WHERE name ILIKE '%banna%' OR slug = 'bannas-chowki';

-- Verify the update
SELECT 
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  '✅ Banna''s Chowki WhatsApp configured' as status
FROM public.cafes 
WHERE name ILIKE '%banna%' OR slug = 'bannas-chowki';

