-- Check Thali descriptions in Cook House
-- Run this in Supabase Dashboard → SQL Editor

SELECT 
    'THALI DESCRIPTIONS CHECK' as status,
    mi.name,
    mi.description,
    LENGTH(mi.description) as description_length
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'COOK HOUSE' 
AND mi.category = 'Thali'
ORDER BY mi.name;
