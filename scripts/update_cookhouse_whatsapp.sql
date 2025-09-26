-- Update Cook House WhatsApp number to 8383080140 for testing
UPDATE public.cafes 
SET 
    whatsapp_phone = '+91 8383080140',
    whatsapp_enabled = true,
    whatsapp_notifications = true,
    updated_at = NOW()
WHERE name = 'COOK HOUSE';

-- Verify the update
SELECT 
    name, 
    whatsapp_phone, 
    whatsapp_enabled, 
    whatsapp_notifications,
    updated_at
FROM public.cafes 
WHERE name = 'COOK HOUSE';
