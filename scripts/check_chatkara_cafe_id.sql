-- Check Chatkara Cafe ID and WhatsApp Configuration
-- This will help us debug why WhatsApp notifications aren't working

-- 1. Find Chatkara cafe details
SELECT 
  'Chatkara Cafe Details:' as info,
  id,
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  is_active,
  created_at,
  updated_at
FROM public.cafes 
WHERE name ILIKE '%chatkara%' OR name = 'CHATKARA';

-- 2. Check if there are multiple Chatkara entries
SELECT 
  'Chatkara Count:' as info,
  COUNT(*) as total_count,
  COUNT(CASE WHEN whatsapp_enabled = true THEN 1 END) as whatsapp_enabled_count,
  COUNT(CASE WHEN whatsapp_phone IS NOT NULL THEN 1 END) as with_phone_count
FROM public.cafes 
WHERE name ILIKE '%chatkara%' OR name = 'CHATKARA';

-- 3. Test the WhatsApp function with the actual Chatkara ID
SELECT 
  'Testing WhatsApp Function:' as info,
  send_whatsapp_notification(
    (SELECT id FROM public.cafes WHERE name ILIKE '%chatkara%' OR name = 'CHATKARA' LIMIT 1),
    jsonb_build_object(
      'order_number', 'DEBUG-CHATKARA-' || EXTRACT(EPOCH FROM NOW())::bigint,
      'customer_name', 'Debug Test Customer',
      'phone_number', '+91 98765 43210',
      'delivery_block', 'B1',
      'total_amount', '250',
      'created_at', NOW()::text,
      'items_text', '• Debug Test Item x1 - ₹250',
      'delivery_notes', 'Debug test for Chatkara WhatsApp',
      'frontend_url', 'https://mujfoodclub.in'
    )
  ) as test_result;

-- 4. Show all cafes with WhatsApp configured
SELECT 
  'All Cafes with WhatsApp:' as info,
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  CASE 
    WHEN whatsapp_enabled AND whatsapp_notifications AND whatsapp_phone IS NOT NULL 
    THEN '✅ Ready'
    ELSE '❌ Not Ready'
  END as status
FROM public.cafes 
WHERE is_active = true AND whatsapp_phone IS NOT NULL
ORDER BY name;
