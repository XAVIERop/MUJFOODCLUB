-- Check Chatkara Indian Combos section for pricing issues
-- Run this in Supabase Dashboard → SQL Editor

-- Check current Indian Combos items
SELECT 
    'CHATKARA INDIAN COMBOS CURRENT' as status,
    mi.name,
    mi.price,
    mi.is_vegetarian,
    mi.id
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'CHATKARA' 
AND mi.category = 'Indian - Combos'
ORDER BY mi.name;

-- Check if there are any Half/Full variants for these items
SELECT 
    'CHATKARA HALF/FULL VARIANTS' as status,
    mi.name,
    mi.price,
    mi.is_vegetarian,
    mi.category,
    mi.id
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE c.name = 'CHATKARA' 
AND (mi.name ILIKE '%(half)%' OR mi.name ILIKE '%(full)%')
AND (mi.name ILIKE '%daal%' OR mi.name ILIKE '%kadhai%' OR mi.name ILIKE '%paneer%' OR mi.name ILIKE '%shahi%')
ORDER BY mi.name;
