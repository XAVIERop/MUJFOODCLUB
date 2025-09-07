-- WhatsApp Setup Script for MUJ Food Club Cafes
-- Run this in your Supabase SQL Editor to configure WhatsApp for all cafes

-- 1. Enable WhatsApp for all active cafes (you'll need to update phone numbers manually)
UPDATE public.cafes 
SET 
  whatsapp_enabled = true,
  whatsapp_notifications = true
WHERE is_active = true;

-- 2. Set example WhatsApp numbers (REPLACE THESE WITH ACTUAL CAFE OWNER NUMBERS)
UPDATE public.cafes 
SET whatsapp_phone = '+91 98765 43210'  -- Replace with actual number
WHERE name = 'Chatkara';

UPDATE public.cafes 
SET whatsapp_phone = '+91 98765 43211'  -- Replace with actual number
WHERE name = 'Food Court';

UPDATE public.cafes 
SET whatsapp_phone = '+91 98765 43212'  -- Replace with actual number
WHERE name = 'Punjabi Tadka';

UPDATE public.cafes 
SET whatsapp_phone = '+91 98765 43213'  -- Replace with actual number
WHERE name = 'Munch Box';

UPDATE public.cafes 
SET whatsapp_phone = '+91 98765 43214'  -- Replace with actual number
WHERE name = 'Mini Meals';

UPDATE public.cafes 
SET whatsapp_phone = '+91 98765 43215'  -- Replace with actual number
WHERE name = 'China Town';

-- 3. Verify the setup
SELECT 
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
WHERE is_active = true
ORDER BY name;

-- 4. Test the WhatsApp notification function
SELECT send_whatsapp_notification(
  (SELECT id FROM public.cafes WHERE name = 'Chatkara' LIMIT 1),
  '{
    "order_number": "TEST-1234567890",
    "customer_name": "Test Customer",
    "phone_number": "+91 98765 43210",
    "delivery_block": "B1",
    "total_amount": "250",
    "created_at": "2024-12-15T14:30:00Z",
    "items_text": "• Test Item x1 - ₹250",
    "delivery_notes": "Test order for WhatsApp integration",
    "frontend_url": "https://mujfoodclub.in"
  }'::jsonb
) as test_result;
