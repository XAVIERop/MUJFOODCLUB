-- Setup WhatsApp notifications for Food Court Cafe
-- Phone: +91 8319941006

-- Update Food Court Cafe with WhatsApp settings
UPDATE public.cafes 
SET 
  whatsapp_phone = '+91 8319941006',
  whatsapp_enabled = true,
  whatsapp_notifications = true,
  updated_at = NOW()
WHERE name = 'Food Court';

-- Verify the update
SELECT 
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  updated_at,
  CASE 
    WHEN whatsapp_enabled AND whatsapp_notifications AND whatsapp_phone IS NOT NULL 
    THEN '✅ Ready for WhatsApp notifications'
    ELSE '❌ Needs configuration'
  END as status
FROM public.cafes 
WHERE name = 'Food Court';

-- Test the WhatsApp notification function for Food Court
SELECT send_whatsapp_notification(
  (SELECT id FROM public.cafes WHERE name = 'Food Court' LIMIT 1),
  '{
    "order_number": "TEST-FOODCOURT-1234567890",
    "customer_name": "Test Customer",
    "phone_number": "+91 98765 43210",
    "delivery_block": "B1",
    "total_amount": "350",
    "created_at": "2024-12-15T15:30:00Z",
    "items_text": "• Food Court Special x1 - ₹200\n• Soft Drink x1 - ₹50\n• Dessert x1 - ₹100",
    "delivery_notes": "Test order for Food Court WhatsApp integration",
    "frontend_url": "https://mujfoodclub.in"
  }'::jsonb
) as test_result;
