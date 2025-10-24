-- Setup Munch Box PrintNode Configuration
-- Run this in Supabase SQL Editor

-- Step 1: Insert Munch Box printer configuration
INSERT INTO public.cafe_printer_configs (
  cafe_id,
  printer_name,
  printer_type,
  connection_type,
  printnode_printer_id,
  created_at,
  updated_at
) VALUES (
  'fecc62c0-2995-4376-8303-59c544d2c3e0', -- Munch Box cafe_id
  'Munch Box Thermal Printer',
  'pixel_thermal',
  'usb',
  74782621, -- Munch Box printer ID
  NOW(),
  NOW()
);

-- Step 2: Verify the configuration
SELECT 
  cpc.id,
  c.name as cafe_name,
  cpc.printer_name,
  cpc.printer_type,
  cpc.connection_type,
  cpc.printnode_printer_id,
  cpc.created_at
FROM public.cafe_printer_configs cpc
JOIN public.cafes c ON cpc.cafe_id = c.id
WHERE c.name ILIKE '%munch%';

-- Step 3: Show all printer configurations for reference
SELECT 
  c.name as cafe_name,
  cpc.printer_name,
  cpc.printnode_printer_id,
  cpc.connection_type
FROM public.cafe_printer_configs cpc
JOIN public.cafes c ON cpc.cafe_id = c.id
ORDER BY c.name;




