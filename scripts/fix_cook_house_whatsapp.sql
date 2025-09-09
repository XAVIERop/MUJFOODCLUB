-- Fix Cook House WhatsApp Configuration
-- This script will properly configure Cook House for WhatsApp notifications

-- 1. First, check if Cook House exists
SELECT 
  'Checking Cook House existence...' as step,
  COUNT(*) as cafe_count
FROM public.cafes 
WHERE name = 'Cook House';

-- 2. Update Cook House with proper WhatsApp configuration
UPDATE public.cafes 
SET 
  whatsapp_phone = '+91 9116966635',
  whatsapp_enabled = true,
  whatsapp_notifications = true,
  updated_at = NOW()
WHERE name = 'Cook House';

-- 3. Verify the update
SELECT 
  'Cook House after update:' as step,
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  is_active,
  updated_at
FROM public.cafes 
WHERE name = 'Cook House';

-- 4. Test the database function (this will return true if configured properly)
SELECT 
  'Testing database function...' as step,
  send_whatsapp_notification(
    (SELECT id FROM public.cafes WHERE name = 'Cook House' LIMIT 1),
    jsonb_build_object(
      'order_number', 'TEST-FIX-' || EXTRACT(EPOCH FROM NOW())::bigint,
      'customer_name', 'Fix Test Customer',
      'phone_number', '+91 98765 43210',
      'delivery_block', 'B1',
      'total_amount', '300',
      'created_at', NOW()::text,
      'items_text', '• Fix Test Item x1 - ₹300',
      'delivery_notes', 'Testing after fix',
      'frontend_url', 'https://mujfoodclub.in'
    )
  ) as test_result;

-- 5. Show final status
SELECT 
  'Final Status Check:' as step,
  CASE 
    WHEN whatsapp_enabled AND whatsapp_notifications AND whatsapp_phone IS NOT NULL 
    THEN '✅ Cook House is ready for WhatsApp notifications'
    ELSE '❌ Cook House still needs configuration'
  END as final_status
FROM public.cafes 
WHERE name = 'Cook House';
