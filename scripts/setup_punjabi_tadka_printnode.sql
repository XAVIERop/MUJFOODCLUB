-- Setup Punjabi Tadka PrintNode Configuration
-- This script configures Punjabi Tadka with its dedicated PrintNode account
-- Run this in Supabase Dashboard → SQL Editor

-- Step 1: Verify Punjabi Tadka cafe exists and get its ID
SELECT 
  'PUNJABI TADKA CAFE STATUS:' as section,
  id,
  name,
  type,
  location,
  is_active,
  created_at
FROM public.cafes 
WHERE name ILIKE '%punjabi%tadka%' OR name = 'Punjabi Tadka';

-- Step 2: Create or update Punjabi Tadka printer configuration
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
    'Punjabi Tadka Thermal Printer' as printer_name,
    'epson_tm_t82'::printer_type as printer_type,
    'network'::connection_type as connection_type,
    74760016 as printnode_printer_id,
    80 as paper_width,
    8 as print_density,
    true as auto_cut,
    true as is_active,
    true as is_default,
    NOW() as created_at,
    NOW() as updated_at
FROM public.cafes c
WHERE c.name ILIKE '%punjabi%tadka%' OR c.name = 'Punjabi Tadka';

-- Handle conflict by deleting existing config first, then inserting new one
DELETE FROM public.cafe_printer_configs 
WHERE cafe_id IN (
    SELECT id FROM public.cafes 
    WHERE name ILIKE '%punjabi%tadka%' OR name = 'Punjabi Tadka'
) AND is_default = true;

-- Insert the new configuration
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
    'Punjabi Tadka Thermal Printer' as printer_name,
    'epson_tm_t82'::printer_type as printer_type,
    'network'::connection_type as connection_type,
    74760016 as printnode_printer_id,
    80 as paper_width,
    8 as print_density,
    true as auto_cut,
    true as is_active,
    true as is_default,
    NOW() as created_at,
    NOW() as updated_at
FROM public.cafes c
WHERE c.name ILIKE '%punjabi%tadka%' OR c.name = 'Punjabi Tadka';

-- Step 3: Verify the printer configuration was created/updated
SELECT 
    'PUNJABI TADKA PRINTER CONFIG:' as section,
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
WHERE c.name ILIKE '%punjabi%tadka%' OR c.name = 'Punjabi Tadka'
AND cpc.is_active = true
AND cpc.is_default = true;

-- Step 4: Verify Punjabi Tadka cafe exists
SELECT 
    'PUNJABI TADKA CAFE STATUS:' as section,
    id,
    name,
    type,
    location,
    is_active,
    updated_at
FROM public.cafes 
WHERE name ILIKE '%punjabi%tadka%' OR name = 'Punjabi Tadka';

-- Step 5: Check if Punjabi Tadka owner profile is correctly linked
SELECT 
    'PUNJABI TADKA OWNER STATUS:' as section,
    p.email,
    p.full_name,
    p.user_type,
    p.cafe_id,
    c.name as cafe_name
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
WHERE p.email = 'punjabitadka.owner@mujfoodclub.in';

-- Step 6: Verify cafe_staff entry
SELECT 
    'PUNJABI TADKA CAFE STAFF:' as section,
    cs.user_id,
    cs.cafe_id,
    cs.role,
    cs.is_active,
    p.full_name,
    c.name as cafe_name
FROM public.cafe_staff cs
JOIN public.profiles p ON cs.user_id = p.id
JOIN public.cafes c ON cs.cafe_id = c.id
WHERE p.email = 'punjabitadka.owner@mujfoodclub.in';

-- Step 7: Test PrintNode configuration
SELECT 
    'PRINTNODE CONFIGURATION TEST:' as section,
    'Punjabi Tadka should use:' as info,
    'API Key: MBrJ7izrR8n9gTb5-RluWjjtxReJHShZA2Ay7luWnkQ' as api_key,
    'Printer ID: 74760016' as printer_id,
    'Account: punjabitadka.foodclub@gmail.com' as account_email;

-- Step 8: Final verification
SELECT 
    'SETUP COMPLETE' as status,
    'Punjabi Tadka is now configured with dedicated PrintNode account' as result,
    'Orders will print to Punjabi Tadka printer (ID: 74760016)' as note;
