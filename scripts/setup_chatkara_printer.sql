-- Setup Chatkara Printer Configuration
-- This script creates a printer configuration for Chatkara cafe

-- Get Chatkara cafe ID and create printer config
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
    'Chatkara Thermal Printer' as printer_name,
    'epson_tm_t82'::printer_type as printer_type,
    'network'::connection_type as connection_type,
    1 as printnode_printer_id, -- Default printer ID - update with actual PrintNode printer ID
    80 as paper_width,
    8 as print_density,
    true as auto_cut,
    true as is_active,
    true as is_default,
    NOW() as created_at,
    NOW() as updated_at
FROM public.cafes c
WHERE c.name ILIKE '%chatkara%'
ON CONFLICT (cafe_id, is_default) 
WHERE is_default = true
DO UPDATE SET
    printer_name = EXCLUDED.printer_name,
    printer_type = EXCLUDED.printer_type,
    connection_type = EXCLUDED.connection_type,
    printnode_printer_id = EXCLUDED.printnode_printer_id,
    paper_width = EXCLUDED.paper_width,
    print_density = EXCLUDED.print_density,
    auto_cut = EXCLUDED.auto_cut,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Verify the configuration was created
SELECT 
    cpc.id,
    c.name as cafe_name,
    cpc.printer_name,
    cpc.printer_type,
    cpc.connection_type,
    cpc.printnode_printer_id,
    cpc.paper_width,
    cpc.print_density,
    cpc.auto_cut,
    cpc.is_active,
    cpc.is_default
FROM public.cafe_printer_configs cpc
JOIN public.cafes c ON cpc.cafe_id = c.id
WHERE c.name ILIKE '%chatkara%'
AND cpc.is_active = true
AND cpc.is_default = true;
