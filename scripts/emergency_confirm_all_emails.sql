-- EMERGENCY FIX: Confirm all unconfirmed emails
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Check current status
SELECT 
  'BEFORE FIX' as status,
  COUNT(*) as unconfirmed_count
FROM auth.users 
WHERE email_confirmed_at IS NULL;

-- 2. Show all unconfirmed users
SELECT 
  'Unconfirmed Users:' as info,
  id,
  email,
  created_at
FROM auth.users 
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;

-- 3. EMERGENCY FIX: Confirm all emails
-- WARNING: This bypasses email verification
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 4. Verify the fix
SELECT 
  'AFTER FIX' as status,
  COUNT(*) as unconfirmed_count
FROM auth.users 
WHERE email_confirmed_at IS NULL;

-- 5. Show confirmed users
SELECT 
  'Recently Confirmed Users:' as info,
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email_confirmed_at IS NOT NULL
ORDER BY email_confirmed_at DESC
LIMIT 10;

-- 6. Summary
SELECT 
  'SUMMARY' as section,
  'Total Users' as metric,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'SUMMARY',
  'Confirmed Users',
  COUNT(*)
FROM auth.users 
WHERE email_confirmed_at IS NOT NULL
UNION ALL
SELECT 
  'SUMMARY',
  'Unconfirmed Users',
  COUNT(*)
FROM auth.users 
WHERE email_confirmed_at IS NULL;
