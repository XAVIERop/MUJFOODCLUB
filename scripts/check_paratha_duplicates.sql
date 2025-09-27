-- Check for paratha duplicates
-- This script identifies duplicate paratha items in the database
-- Run this in Supabase Dashboard → SQL Editor

-- Show all paratha items
SELECT 
    'PARATHA ITEMS CHECK' as status,
    COUNT(*) as total_parathas
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Breads'
AND mi.name ILIKE '%paratha%';

-- Show all paratha items with details
SELECT 
    mi.name,
    mi.price,
    mi.is_available,
    'Current Item' as status
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Breads'
AND mi.name ILIKE '%paratha%'
ORDER BY mi.name;

-- Check for potential duplicates (same base name with different variants)
SELECT 
    CASE 
        WHEN mi.name ILIKE '%pudina laccha paratha%' THEN 'Pudina Laccha Paratha'
        WHEN mi.name ILIKE '%hari mirch laccha paratha%' THEN 'Hari Mirch Laccha Paratha'
        WHEN mi.name ILIKE '%laccha paratha%' AND mi.name NOT ILIKE '%pudina%' AND mi.name NOT ILIKE '%hari mirch%' THEN 'Laccha Paratha'
        ELSE 'Other Paratha'
    END as base_name,
    COUNT(*) as count,
    STRING_AGG(mi.name, ', ') as item_names
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Breads'
AND mi.name ILIKE '%paratha%'
GROUP BY 
    CASE 
        WHEN mi.name ILIKE '%pudina laccha paratha%' THEN 'Pudina Laccha Paratha'
        WHEN mi.name ILIKE '%hari mirch laccha paratha%' THEN 'Hari Mirch Laccha Paratha'
        WHEN mi.name ILIKE '%laccha paratha%' AND mi.name NOT ILIKE '%pudina%' AND mi.name NOT ILIKE '%hari mirch%' THEN 'Laccha Paratha'
        ELSE 'Other Paratha'
    END
ORDER BY base_name;
