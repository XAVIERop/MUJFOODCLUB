-- Fix phone number storage issue
-- This script checks and fixes phone number storage in the database

-- 1. First, check if phone column exists
DO $$
BEGIN
    -- Check if phone column exists in profiles table
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'phone'
    ) THEN
        -- Add phone column if it doesn't exist
        ALTER TABLE profiles ADD COLUMN phone VARCHAR(15);
        RAISE NOTICE 'Added phone column to profiles table';
    ELSE
        RAISE NOTICE 'Phone column already exists in profiles table';
    END IF;
END $$;

-- 2. Check current phone column properties
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'phone';

-- 3. Update phone column to be more permissive if needed
ALTER TABLE profiles 
ALTER COLUMN phone TYPE VARCHAR(20);

-- 4. Check if there are any profiles with phone numbers
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 END) as with_phone,
    COUNT(CASE WHEN phone IS NULL OR phone = '' THEN 1 END) as without_phone
FROM profiles;

-- 5. Show sample profiles with phone data
SELECT 
    id,
    email,
    full_name,
    phone,
    block,
    created_at
FROM profiles 
WHERE phone IS NOT NULL 
AND phone != ''
ORDER BY created_at DESC
LIMIT 5;

-- 6. Show profiles without phone data
SELECT 
    id,
    email,
    full_name,
    phone,
    block,
    created_at
FROM profiles 
WHERE phone IS NULL 
OR phone = ''
ORDER BY created_at DESC
LIMIT 5;
