-- Check phone number storage in database
-- This script helps diagnose why phone numbers might not be stored

-- 1. Check if phone column exists in profiles table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'phone';

-- 2. Check profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 3. Check if any profiles have phone numbers
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
LIMIT 10;

-- 4. Check profiles without phone numbers
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
LIMIT 10;

-- 5. Check total count of profiles with/without phone
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 END) as profiles_with_phone,
    COUNT(CASE WHEN phone IS NULL OR phone = '' THEN 1 END) as profiles_without_phone
FROM profiles;

-- 6. Check recent signups and their phone data
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.phone,
    p.block,
    p.created_at,
    u.created_at as auth_created_at,
    u.user_metadata
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC
LIMIT 5;
