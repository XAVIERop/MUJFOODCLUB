-- Check the current schema of menu_items table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'menu_items' 
AND table_schema = 'public'
ORDER BY ordinal_position;
