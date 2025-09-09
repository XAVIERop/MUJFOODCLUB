-- Check WhatsApp Setup Status for All Cafes
-- This script will show the current WhatsApp configuration status

-- 1. Check all cafes WhatsApp configuration
SELECT 
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  is_active,
  CASE 
    WHEN whatsapp_enabled AND whatsapp_notifications AND whatsapp_phone IS NOT NULL AND is_active
    THEN '✅ Ready for WhatsApp notifications'
    WHEN NOT is_active
    THEN '❌ Cafe not active'
    WHEN NOT whatsapp_enabled
    THEN '❌ WhatsApp disabled'
    WHEN NOT whatsapp_notifications
    THEN '❌ Notifications disabled'
    WHEN whatsapp_phone IS NULL
    THEN '❌ No phone number'
    ELSE '❌ Unknown issue'
  END as status
FROM public.cafes 
ORDER BY name;

-- 2. Check if Cook House exists and is configured
SELECT 
  'Cook House Configuration Check' as check_type,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ Cook House not found'
    WHEN COUNT(*) = 1 THEN '✅ Cook House found'
    ELSE '⚠️ Multiple Cook House entries found'
  END as result
FROM public.cafes 
WHERE name = 'Cook House';

-- 3. Detailed Cook House status
SELECT 
  'Cook House Details' as check_type,
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  is_active,
  created_at,
  updated_at
FROM public.cafes 
WHERE name = 'Cook House';

-- 4. Test the database function (this will only log, not actually send)
SELECT 
  'Database Function Test' as test_type,
  send_whatsapp_notification(
    (SELECT id FROM public.cafes WHERE name = 'Cook House' LIMIT 1),
    jsonb_build_object(
      'order_number', 'TEST-DB-' || EXTRACT(EPOCH FROM NOW())::bigint,
      'customer_name', 'Database Test Customer',
      'phone_number', '+91 98765 43210',
      'delivery_block', 'B1',
      'total_amount', '250',
      'created_at', NOW()::text,
      'items_text', '• Database Test Item x1 - ₹250',
      'delivery_notes', 'Testing database function only',
      'frontend_url', 'https://mujfoodclub.in'
    )
  ) as function_result;

-- Note: The database function only logs the notification.
-- Real WhatsApp sending happens in the frontend service.
-- Check the browser console when placing actual orders.
