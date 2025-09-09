-- Update Cook House Cafe with WhatsApp Configuration
-- Phone: +91 9116966635

-- Update Cook House Cafe with WhatsApp settings
UPDATE public.cafes 
SET 
  whatsapp_phone = '+91 9116966635',
  whatsapp_enabled = true,
  whatsapp_notifications = true,
  updated_at = NOW()
WHERE name = 'Cook House';

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
WHERE name = 'Cook House';

-- Test the WhatsApp notification function for Cook House
SELECT send_whatsapp_notification(
  (SELECT id FROM public.cafes WHERE name = 'Cook House' LIMIT 1),
  jsonb_build_object(
    'order_number', 'TEST-COOKHOUSE-' || EXTRACT(EPOCH FROM NOW())::bigint,
    'customer_name', 'Test Customer',
    'phone_number', '+91 98765 43210',
    'delivery_block', 'B1',
    'total_amount', '450',
    'created_at', NOW()::text,
    'items_text', '• Cook House Special x1 - ₹300\n• Soft Drink x1 - ₹50\n• Dessert x1 - ₹100',
    'delivery_notes', 'Test order for Cook House WhatsApp integration',
    'frontend_url', 'https://mujfoodclub.in'
  )
) as test_result;
