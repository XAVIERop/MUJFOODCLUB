-- Check Profiles Table Structure
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Check what columns exist in the profiles table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if the test user exists and what data it has
SELECT 
  'Current test user data:' as info,
  *
FROM public.profiles 
WHERE email = 'test@muj.manipal.edu';
