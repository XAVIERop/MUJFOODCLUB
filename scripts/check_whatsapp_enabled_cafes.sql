-- Check which cafes have WhatsApp notifications enabled
-- This query shows all cafes with their WhatsApp configuration status

SELECT 
    id,
    name,
    slug,
    whatsapp_phone,
    whatsapp_enabled,
    whatsapp_notifications,
    CASE 
        WHEN whatsapp_enabled = true AND whatsapp_notifications = true AND whatsapp_phone IS NOT NULL 
        THEN '✅ FULLY ENABLED'
        WHEN whatsapp_enabled = true AND whatsapp_notifications = true AND whatsapp_phone IS NULL 
        THEN '⚠️ ENABLED BUT NO PHONE'
        WHEN whatsapp_enabled = true AND whatsapp_notifications = false 
        THEN '⚠️ ENABLED BUT NOTIFICATIONS OFF'
        WHEN whatsapp_enabled = false 
        THEN '❌ DISABLED'
        ELSE '❓ UNKNOWN'
    END as whatsapp_status,
    is_active,
    accepting_orders
FROM public.cafes
ORDER BY 
    CASE 
        WHEN whatsapp_enabled = true AND whatsapp_notifications = true AND whatsapp_phone IS NOT NULL THEN 1
        WHEN whatsapp_enabled = true THEN 2
        ELSE 3
    END,
    name ASC;

-- Summary count
SELECT 
    'Summary' as report_type,
    COUNT(*) FILTER (WHERE whatsapp_enabled = true AND whatsapp_notifications = true AND whatsapp_phone IS NOT NULL) as fully_enabled,
    COUNT(*) FILTER (WHERE whatsapp_enabled = true AND (whatsapp_notifications = false OR whatsapp_phone IS NULL)) as partially_enabled,
    COUNT(*) FILTER (WHERE whatsapp_enabled = false) as disabled,
    COUNT(*) as total_cafes
FROM public.cafes;

-- List only fully enabled cafes (ready to receive WhatsApp notifications)
SELECT 
    'Fully Enabled Cafes' as report_type,
    name,
    slug,
    whatsapp_phone,
    is_active,
    accepting_orders
FROM public.cafes
WHERE whatsapp_enabled = true 
    AND whatsapp_notifications = true 
    AND whatsapp_phone IS NOT NULL
    AND whatsapp_phone != ''
ORDER BY name ASC;

