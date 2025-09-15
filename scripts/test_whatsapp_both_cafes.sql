-- =====================================================
-- Test WhatsApp Configuration for Both Cafes
-- =====================================================

-- 1. Check WhatsApp configuration for both cafes
SELECT 
    '=== WHATSAPP CONFIGURATION CHECK ===' as section,
    name,
    whatsapp_phone,
    whatsapp_enabled,
    whatsapp_notifications,
    CASE 
        WHEN whatsapp_phone IS NOT NULL AND whatsapp_enabled = true AND whatsapp_notifications = true 
        THEN '✅ READY FOR WHATSAPP'
        WHEN whatsapp_phone IS NULL 
        THEN '❌ MISSING PHONE NUMBER'
        WHEN whatsapp_enabled = false 
        THEN '❌ WHATSAPP DISABLED'
        WHEN whatsapp_notifications = false 
        THEN '❌ NOTIFICATIONS DISABLED'
        ELSE '⚠️ PARTIALLY CONFIGURED'
    END as status
FROM public.cafes 
WHERE name IN ('COOK HOUSE', 'Mini Meals')
ORDER BY name;

-- 2. Check cafe staff assignments
SELECT 
    '=== CAFE STAFF ASSIGNMENTS ===' as section,
    c.name as cafe_name,
    p.full_name as staff_name,
    p.email as staff_email,
    cs.role,
    cs.is_active,
    CASE 
        WHEN cs.role = 'owner' AND cs.is_active = true 
        THEN '✅ OWNER ACTIVE'
        WHEN cs.role = 'staff' AND cs.is_active = true 
        THEN '✅ STAFF ACTIVE'
        ELSE '❌ INACTIVE'
    END as staff_status
FROM public.cafes c
LEFT JOIN public.cafe_staff cs ON c.id = cs.cafe_id
LEFT JOIN public.profiles p ON cs.user_id = p.id
WHERE c.name IN ('COOK HOUSE', 'Mini Meals')
ORDER BY c.name, cs.role DESC;

-- 3. Test order data for WhatsApp (sample)
SELECT 
    '=== SAMPLE ORDER DATA FOR WHATSAPP TEST ===' as section,
    'Use this data to test WhatsApp notifications' as note;

-- Sample order data for Cook House
SELECT 
    'COOK HOUSE TEST ORDER' as cafe,
    'ORD-TEST-COOKHOUSE-' || EXTRACT(EPOCH FROM NOW())::BIGINT as order_number,
    'Test Customer' as customer_name,
    '+91 98765 43210' as phone_number,
    'B1' as delivery_block,
    450.00 as total_amount,
    NOW() as created_at;

-- Sample order data for Mini Meals
SELECT 
    'MINI MEALS TEST ORDER' as cafe,
    'ORD-TEST-MINIMEALS-' || EXTRACT(EPOCH FROM NOW())::BIGINT as order_number,
    'Test Customer' as customer_name,
    '+91 98765 43210' as phone_number,
    'B1' as delivery_block,
    250.00 as total_amount,
    NOW() as created_at;
