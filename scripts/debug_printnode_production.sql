-- Debug PrintNode production issues
-- This script helps identify potential issues with PrintNode configuration

-- Check if Punjabi Tadka cafe exists and has correct name
SELECT 
    id,
    name,
    accepting_orders,
    created_at
FROM public.cafes 
WHERE name ILIKE '%punjabi%' 
   OR name ILIKE '%tadka%'
ORDER BY name;

-- Check if there are any printer configurations for Punjabi Tadka
SELECT 
    c.name as cafe_name,
    cpc.*
FROM public.cafe_printer_configs cpc
JOIN public.cafes c ON cpc.cafe_id = c.id
WHERE c.name ILIKE '%punjabi%' 
   OR c.name ILIKE '%tadka%';

-- Check recent orders for Punjabi Tadka to see if printing was attempted
SELECT 
    o.id,
    o.order_number,
    o.cafe_id,
    c.name as cafe_name,
    o.status,
    o.created_at
FROM public.orders o
JOIN public.cafes c ON o.cafe_id = c.id
WHERE c.name ILIKE '%punjabi%' 
   OR c.name ILIKE '%tadka%'
ORDER BY o.created_at DESC
LIMIT 10;
