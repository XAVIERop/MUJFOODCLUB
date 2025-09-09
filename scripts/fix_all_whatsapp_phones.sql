-- Fix All WhatsApp Phone Numbers
-- This script will properly configure WhatsApp for all cafes

-- 1. First, let's see all current cafe configurations
SELECT 
  'Current Cafe Configurations:' as info,
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  is_active
FROM public.cafes 
WHERE is_active = true
ORDER BY name;

-- 2. Update Cook House (try different name variations)
UPDATE public.cafes 
SET 
  whatsapp_phone = '+91 9116966635',
  whatsapp_enabled = true,
  whatsapp_notifications = true,
  updated_at = NOW()
WHERE name ILIKE '%cook%house%' OR name ILIKE '%cookhouse%' OR name = 'COOK HOUSE';

-- 3. Update Food Court with the correct number (from the screenshot)
UPDATE public.cafes 
SET 
  whatsapp_phone = '+91 8383080140',
  whatsapp_enabled = true,
  whatsapp_notifications = true,
  updated_at = NOW()
WHERE name ILIKE '%food%court%' OR name = 'FOOD COURT';

-- 4. Verify the updates
SELECT 
  'After Updates:' as info,
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  is_active,
  updated_at
FROM public.cafes 
WHERE name ILIKE '%cook%house%' OR name ILIKE '%cookhouse%' OR name = 'COOK HOUSE'
   OR name ILIKE '%food%court%' OR name = 'FOOD COURT'
ORDER BY name;

-- 5. Test both cafes
SELECT 
  'Testing Cook House:' as test_type,
  send_whatsapp_notification(
    (SELECT id FROM public.cafes WHERE name ILIKE '%cook%house%' OR name ILIKE '%cookhouse%' OR name = 'COOK HOUSE' LIMIT 1),
    jsonb_build_object(
      'order_number', 'TEST-COOK-' || EXTRACT(EPOCH FROM NOW())::bigint,
      'customer_name', 'Test Customer',
      'phone_number', '+91 98765 43210',
      'delivery_block', 'B1',
      'total_amount', '250',
      'created_at', NOW()::text,
      'items_text', '• Cook House Test Item x1 - ₹250',
      'delivery_notes', 'Testing Cook House WhatsApp',
      'frontend_url', 'https://mujfoodclub.in'
    )
  ) as cook_house_result;

SELECT 
  'Testing Food Court:' as test_type,
  send_whatsapp_notification(
    (SELECT id FROM public.cafes WHERE name ILIKE '%food%court%' OR name = 'FOOD COURT' LIMIT 1),
    jsonb_build_object(
      'order_number', 'TEST-FC-' || EXTRACT(EPOCH FROM NOW())::bigint,
      'customer_name', 'Test Customer',
      'phone_number', '+91 98765 43210',
      'delivery_block', 'B1',
      'total_amount', '200',
      'created_at', NOW()::text,
      'items_text', '• Food Court Test Item x1 - ₹200',
      'delivery_notes', 'Testing Food Court WhatsApp',
      'frontend_url', 'https://mujfoodclub.in'
    )
  ) as food_court_result;

-- 6. Final status check
SELECT 
  'Final Status:' as info,
  name,
  whatsapp_phone,
  CASE 
    WHEN whatsapp_enabled AND whatsapp_notifications AND whatsapp_phone IS NOT NULL 
    THEN '✅ Ready for WhatsApp'
    ELSE '❌ Not Ready'
  END as status
FROM public.cafes 
WHERE is_active = true
ORDER BY name;
