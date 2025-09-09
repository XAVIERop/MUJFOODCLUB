-- Update Chatkara Cafe with WhatsApp Configuration
-- Phone: +91 8905962406

-- Update Chatkara Cafe with WhatsApp settings
UPDATE public.cafes 
SET 
  whatsapp_phone = '+91 8905962406',
  whatsapp_enabled = true,
  whatsapp_notifications = true,
  updated_at = NOW()
WHERE name ILIKE '%chatkara%' OR name = 'CHATKARA';

-- Verify the update
SELECT 
  'Chatkara after update:' as step,
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  is_active,
  updated_at
FROM public.cafes 
WHERE name ILIKE '%chatkara%' OR name = 'CHATKARA';

-- Test the WhatsApp notification function for Chatkara
SELECT 
  'Testing Chatkara WhatsApp...' as test_info,
  send_whatsapp_notification(
    (SELECT id FROM public.cafes WHERE name ILIKE '%chatkara%' OR name = 'CHATKARA' LIMIT 1),
    jsonb_build_object(
      'order_number', 'TEST-CHATKARA-' || EXTRACT(EPOCH FROM NOW())::bigint,
      'customer_name', 'Test Customer',
      'phone_number', '+91 98765 43210',
      'delivery_block', 'B1',
      'total_amount', '300',
      'created_at', NOW()::text,
      'items_text', '• Chatkara Special x1 - ₹200\n• Soft Drink x1 - ₹50\n• Dessert x1 - ₹50',
      'delivery_notes', 'Test order for Chatkara WhatsApp integration',
      'frontend_url', 'https://mujfoodclub.in'
    )
  ) as test_result;

-- Show final status
SELECT 
  'Final Status Check:' as step,
  CASE 
    WHEN whatsapp_enabled AND whatsapp_notifications AND whatsapp_phone IS NOT NULL 
    THEN '✅ Chatkara is ready for WhatsApp notifications'
    ELSE '❌ Chatkara still needs configuration'
  END as final_status
FROM public.cafes 
WHERE name ILIKE '%chatkara%' OR name = 'CHATKARA';
