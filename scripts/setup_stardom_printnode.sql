-- Setup STARDOM Café & Lounge PrintNode Configuration
-- This script configures Stardom with its dedicated PrintNode account
-- Run this in Supabase Dashboard → SQL Editor

-- Step 1: Verify Stardom cafe exists and get its ID
SELECT 
  'STARDOM CAFE STATUS:' as section,
  id,
  name,
  type,
  location,
  is_active,
  created_at
FROM public.cafes 
WHERE name ILIKE '%stardom%';

-- Step 2: Delete any existing default configs for Stardom (to avoid conflicts)
DELETE FROM public.cafe_printer_configs 
WHERE cafe_id IN (
    SELECT id FROM public.cafes 
    WHERE name ILIKE '%stardom%'
) AND is_default = true;

-- Step 3: Insert Stardom printer configuration
INSERT INTO public.cafe_printer_configs (
    cafe_id,
    printer_name,
    printer_type,
    connection_type,
    printnode_printer_id,
    paper_width,
    print_density,
    auto_cut,
    is_active,
    is_default,
    created_at,
    updated_at
)
SELECT 
    c.id as cafe_id,
    'STARDOM THERMAL Receipt Printer' as printer_name,
    'pixel_thermal'::printer_type as printer_type,
    'usb'::connection_type as connection_type,
    74910967 as printnode_printer_id, -- Stardom THERMAL Receipt Printer
    80 as paper_width,
    8 as print_density,
    true as auto_cut,
    true as is_active,
    true as is_default,
    NOW() as created_at,
    NOW() as updated_at
FROM public.cafes c
WHERE c.name ILIKE '%stardom%'
  AND NOT EXISTS (
    SELECT 1 FROM public.cafe_printer_configs cpc2
    WHERE cpc2.cafe_id = c.id AND cpc2.is_default = true
  );

-- Step 4: Verify the configuration was created
SELECT 
  'STARDOM PRINTER CONFIG:' as section,
  cpc.id,
  c.name as cafe_name,
  cpc.printer_name,
  cpc.printer_type,
  cpc.connection_type,
  cpc.printnode_printer_id,
  cpc.paper_width,
  cpc.is_active,
  cpc.is_default,
  cpc.created_at
FROM public.cafe_printer_configs cpc
JOIN public.cafes c ON cpc.cafe_id = c.id
WHERE c.name ILIKE '%stardom%'
ORDER BY cpc.is_default DESC, cpc.created_at DESC;

-- Step 5: Summary
SELECT 
  'SUMMARY:' as section,
  COUNT(*) as total_configs,
  COUNT(CASE WHEN cpc.is_active = true THEN 1 END) as active_configs,
  COUNT(CASE WHEN cpc.is_default = true THEN 1 END) as default_configs
FROM public.cafe_printer_configs cpc
JOIN public.cafes c ON cpc.cafe_id = c.id
WHERE c.name ILIKE '%stardom%';

