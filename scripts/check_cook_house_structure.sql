-- Check how Cook House stores its variants (Half/Full)
-- This will show us the actual structure they use

-- Get Cook House menu items to see how variants are stored
SELECT 
    mi.id,
    mi.name,
    mi.price,
    mi.description,
    mi.category,
    mi.is_available
FROM public.menu_items mi
WHERE 
    mi.cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%cook house%')
ORDER BY mi.name
LIMIT 10;

-- Check if there are any tables that might store variants
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND (column_name LIKE '%variant%' OR column_name LIKE '%portion%' OR column_name LIKE '%size%')
ORDER BY table_name, column_name;
