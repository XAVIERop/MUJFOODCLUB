-- Check the structure of cafe_staff table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'cafe_staff'
ORDER BY ordinal_position;

-- Check a sample record
SELECT * FROM public.cafe_staff LIMIT 5;
