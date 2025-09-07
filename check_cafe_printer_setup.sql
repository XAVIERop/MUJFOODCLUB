-- Check cafe printer configurations setup
-- Run this in Supabase SQL Editor to verify everything is configured correctly

-- 1. Check if cafe_printer_configs table exists and has data
SELECT 'Cafe Printer Configs Table:' as status;
SELECT 
    cpc.id,
    cpc.cafe_id,
    c.name as cafe_name,
    cpc.printer_name,
    cpc.printer_type,
    cpc.connection_type,
    cpc.printnode_printer_id,
    cpc.is_active,
    cpc.created_at
FROM public.cafe_printer_configs cpc
JOIN public.cafes c ON cpc.cafe_id = c.id
ORDER BY c.name;

-- 2. Check specific cafes (Chatkara and Food Court)
SELECT 'Chatkara and Food Court Configs:' as status;
SELECT 
    c.name as cafe_name,
    cpc.printer_name,
    cpc.printnode_printer_id,
    cpc.is_active
FROM public.cafe_printer_configs cpc
JOIN public.cafes c ON cpc.cafe_id = c.id
WHERE c.name ILIKE '%chatkara%' OR c.name ILIKE '%food court%'
ORDER BY c.name;

-- 3. Check if printnode_printer_id column exists
SELECT 'PrintNode Printer ID Column Check:' as status;
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'cafe_printer_configs' 
  AND column_name = 'printnode_printer_id';

-- 4. Check recent orders to see cafe_id values
SELECT 'Recent Orders with Cafe Info:' as status;
SELECT 
    o.order_number,
    o.cafe_id,
    c.name as cafe_name,
    o.status,
    o.created_at
FROM public.orders o
JOIN public.cafes c ON o.cafe_id = c.id
ORDER BY o.created_at DESC
LIMIT 5;

-- 5. Final status
SELECT 'Setup check complete! Review the results above.' as status;
