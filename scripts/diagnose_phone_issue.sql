-- Comprehensive phone number storage diagnosis
-- This script will help identify why phone numbers are not being stored

-- 1. Check if profiles table exists and its structure
SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Check if phone column exists specifically
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'phone'
        ) 
        THEN 'Phone column EXISTS' 
        ELSE 'Phone column MISSING' 
    END as phone_column_status;

-- 3. If phone column doesn't exist, create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'phone'
    ) THEN
        ALTER TABLE profiles ADD COLUMN phone VARCHAR(20);
        RAISE NOTICE 'CREATED phone column in profiles table';
    ELSE
        RAISE NOTICE 'Phone column already exists';
    END IF;
END $$;

-- 4. Check total profiles count
SELECT COUNT(*) as total_profiles FROM profiles;

-- 5. Check profiles with phone numbers
SELECT 
    COUNT(*) as profiles_with_phone,
    COUNT(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 END) as non_empty_phone
FROM profiles;

-- 6. Show recent profiles and their phone data
SELECT 
    id,
    email,
    full_name,
    phone,
    block,
    created_at,
    CASE 
        WHEN phone IS NULL THEN 'NULL'
        WHEN phone = '' THEN 'EMPTY'
        ELSE 'HAS_PHONE'
    END as phone_status
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- 7. Check auth.users metadata for phone numbers
SELECT 
    id,
    email,
    user_metadata,
    created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 8. Check if there are any constraints or triggers affecting phone storage
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'profiles';

-- 9. Check for any RLS policies that might affect phone storage
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';
