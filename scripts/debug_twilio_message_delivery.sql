-- Debug Twilio Message Delivery
-- This will help us understand why messages aren't being delivered

-- 1. Check if the phone number needs to join the Twilio sandbox first
SELECT 
  'Twilio Sandbox Setup Required:' as info,
  'The phone number +91 8905962406 needs to send "join <sandbox-code>" to +1 415 523 8886 first' as instruction;

-- 2. Check current Twilio sandbox configuration
SELECT 
  'Current Twilio Configuration:' as info,
  'From Number: +1 415 523 8886 (Twilio Sandbox)' as from_number,
  'To Number: +91 8905962406 (Chatkara)' as to_number,
  'Sandbox Code: Check Twilio Console for the exact code' as sandbox_code;

-- 3. Test with a simple message format
SELECT 
  'Testing Simple Message Format:' as info,
  send_whatsapp_notification(
    (SELECT id FROM public.cafes WHERE name ILIKE '%chatkara%' OR name = 'CHATKARA' LIMIT 1),
    jsonb_build_object(
      'order_number', 'SIMPLE-TEST-' || EXTRACT(EPOCH FROM NOW())::bigint,
      'customer_name', 'Simple Test',
      'phone_number', '+91 98765 43210',
      'delivery_block', 'B1',
      'total_amount', '100',
      'created_at', NOW()::text,
      'items_text', '• Simple Test Item x1 - ₹100',
      'delivery_notes', 'Simple test message',
      'frontend_url', 'https://mujfoodclub.in'
    )
  ) as simple_test_result;
