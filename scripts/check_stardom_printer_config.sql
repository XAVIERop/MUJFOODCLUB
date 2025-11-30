-- Check Stardom printer configuration in database
-- This script verifies if Stardom has a printer config set up

-- First, find Stardom cafe ID
SELECT 
    id,
    name,
    slug,
    location_scope
FROM public.cafes 
WHERE name ILIKE '%stardom%'
ORDER BY name;

-- Then check printer configs for Stardom
SELECT 
    cpc.id,
    cpc.cafe_id,
    c.name as cafe_name,
    cpc.printer_name,
    cpc.printer_type,
    cpc.connection_type,
    cpc.printnode_printer_id,
    cpc.is_active,
    cpc.is_default,
    cpc.created_at,
    cpc.updated_at
FROM public.cafe_printer_configs cpc
JOIN public.cafes c ON cpc.cafe_id = c.id
WHERE c.name ILIKE '%stardom%'
ORDER BY cpc.is_default DESC, cpc.created_at DESC;

-- Summary
SELECT 
    COUNT(*) as total_configs,
    COUNT(CASE WHEN cpc.is_active = true THEN 1 END) as active_configs,
    COUNT(CASE WHEN cpc.is_default = true THEN 1 END) as default_configs
FROM public.cafe_printer_configs cpc
JOIN public.cafes c ON cpc.cafe_id = c.id
WHERE c.name ILIKE '%stardom%';

