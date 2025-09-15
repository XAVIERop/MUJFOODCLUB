-- =====================================================
-- Disable WhatsApp for Cafes Without Phone Numbers
-- =====================================================

-- Disable WhatsApp notifications for cafes that don't have phone numbers
UPDATE public.cafes 
SET 
  whatsapp_enabled = false,
  whatsapp_notifications = false
WHERE whatsapp_phone IS NULL 
  AND is_active = true;

-- Verify the changes
SELECT 
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  CASE 
    WHEN whatsapp_phone IS NULL THEN '❌ No Phone Number'
    ELSE '✅ Configured'
  END as status
FROM public.cafes 
WHERE is_active = true
ORDER BY whatsapp_enabled DESC, name;
