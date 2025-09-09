-- Emergency Fix for Cook House WhatsApp Configuration
-- This will ensure Cook House is properly configured

-- 1. Check current Cook House status
SELECT 
  'Current Cook House Status:' as info,
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  is_active
FROM public.cafes 
WHERE name ILIKE '%cook%house%' OR name ILIKE '%cookhouse%';

-- 2. Update Cook House with correct phone number
UPDATE public.cafes 
SET 
  whatsapp_phone = '+91 9116966635',
  whatsapp_enabled = true,
  whatsapp_notifications = true,
  updated_at = NOW()
WHERE name ILIKE '%cook%house%' OR name ILIKE '%cookhouse%';

-- 3. Verify the update worked
SELECT 
  'After Update:' as info,
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  is_active,
  updated_at
FROM public.cafes 
WHERE name ILIKE '%cook%house%' OR name ILIKE '%cookhouse%';

-- 4. Test the database function
SELECT 
  'Testing Database Function:' as info,
  send_whatsapp_notification(
    (SELECT id FROM public.cafes WHERE name ILIKE '%cook%house%' OR name ILIKE '%cookhouse%' LIMIT 1),
    jsonb_build_object(
      'order_number', 'EMERGENCY-TEST-' || EXTRACT(EPOCH FROM NOW())::bigint,
      'customer_name', 'Emergency Test',
      'phone_number', '+91 98765 43210',
      'delivery_block', 'B1',
      'total_amount', '100',
      'created_at', NOW()::text,
      'items_text', '• Emergency Test Item x1 - ₹100',
      'delivery_notes', 'Emergency test after fix',
      'frontend_url', 'https://mujfoodclub.in'
    )
  ) as test_result;

-- 5. Show all cafes with WhatsApp status
SELECT 
  'All Cafes WhatsApp Status:' as info,
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
WHERE is_active = true
ORDER BY name;
