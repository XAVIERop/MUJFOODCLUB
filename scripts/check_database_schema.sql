-- Check database schema for menu items and variants
-- This will show us the actual table structure

-- Check all tables related to menu items
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%menu%'
ORDER BY table_name;

-- Check columns in menu_items table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'menu_items'
ORDER BY ordinal_position;

-- Check if there are any variant-related tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%variant%' OR table_name LIKE '%portion%' OR table_name LIKE '%size%')
ORDER BY table_name;
