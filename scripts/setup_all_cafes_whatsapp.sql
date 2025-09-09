-- Complete WhatsApp Setup for All MUJ Food Club Cafes
-- Each cafe will receive notifications on their specific phone numbers

-- 1. Enable WhatsApp for all active cafes
UPDATE public.cafes 
SET 
  whatsapp_enabled = true,
  whatsapp_notifications = true,
  updated_at = NOW()
WHERE is_active = true;

-- 2. Set specific WhatsApp numbers for each cafe
-- Cook House
UPDATE public.cafes 
SET whatsapp_phone = '+91 9116966635'
WHERE name = 'Cook House';

-- Food Court (already configured)
UPDATE public.cafes 
SET whatsapp_phone = '+91 8383080140'
WHERE name = 'Food Court';

-- Chatkara
UPDATE public.cafes 
SET whatsapp_phone = '+91 8905962406'
WHERE name ILIKE '%chatkara%' OR name = 'CHATKARA';

-- Add other cafes as their phone numbers are provided
-- UPDATE public.cafes 
-- SET whatsapp_phone = '+91 XXXXXXXXXX'
-- WHERE name = 'Cafe Name';

-- 3. Verify the setup for all cafes
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

-- 4. Test WhatsApp notification for Cook House
SELECT 'Testing Cook House WhatsApp...' as test_info;
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
) as cook_house_test_result;

-- 5. Test WhatsApp notification for Food Court
SELECT 'Testing Food Court WhatsApp...' as test_info;
SELECT send_whatsapp_notification(
  (SELECT id FROM public.cafes WHERE name = 'Food Court' LIMIT 1),
  jsonb_build_object(
    'order_number', 'TEST-FOODCOURT-' || EXTRACT(EPOCH FROM NOW())::bigint,
    'customer_name', 'Test Customer',
    'phone_number', '+91 98765 43210',
    'delivery_block', 'B1',
    'total_amount', '350',
    'created_at', NOW()::text,
    'items_text', '• Food Court Special x1 - ₹200\n• Soft Drink x1 - ₹50\n• Dessert x1 - ₹100',
    'delivery_notes', 'Test order for Food Court WhatsApp integration',
    'frontend_url', 'https://mujfoodclub.in'
  )
) as food_court_test_result;

-- 6. Test WhatsApp notification for Chatkara
SELECT 'Testing Chatkara WhatsApp...' as test_info;
SELECT send_whatsapp_notification(
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
) as chatkara_test_result;
