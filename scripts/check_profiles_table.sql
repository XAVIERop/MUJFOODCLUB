-- Check current profiles table structure
-- Run this first to see what columns already exist

-- Check table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check if user_type column exists and what values it has
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'profiles' AND column_name = 'user_type') 
        THEN 'user_type column EXISTS'
        ELSE 'user_type column MISSING'
        END as user_type_status;

-- Check if cafe_id column exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'profiles' AND column_name = 'cafe_id') 
        THEN 'cafe_id column EXISTS'
        ELSE 'cafe_id column MISSING'
        END as cafe_id_status;

-- Check if block column is nullable
SELECT 
    CASE 
        WHEN is_nullable = 'YES' THEN 'block column is NULLABLE'
        ELSE 'block column is NOT NULL'
        END as block_nullable_status
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'block';

-- Show sample data from profiles table
SELECT 
    id,
    email,
    full_name,
    user_type,
    cafe_id,
    block,
    created_at
FROM public.profiles 
LIMIT 5;
