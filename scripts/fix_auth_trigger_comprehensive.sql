-- COMPREHENSIVE AUTH TRIGGER FIX
-- This script fixes the handle_new_user trigger to include all required fields
-- Run this script in Supabase SQL Editor

-- First, let's check the current trigger and function
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check current function definition
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Drop the existing trigger and function to recreate them properly
-- First, let's find the exact trigger name
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%handle_new_user%' OR trigger_name LIKE '%auth_user%';

-- Drop ALL possible trigger names
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_trigger ON auth.users;

-- Now drop the function with CASCADE to handle dependencies
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the COMPLETE handle_new_user function with all required fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Insert profile with ALL required fields including block and user_type
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name,
    block,
    user_type,
    qr_code,
    loyalty_points,
    loyalty_tier,
    total_orders,
    total_spent,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'block')::block_type, 'B1'),
    'student', -- Default user_type for auth signups
    'STUDENT_' || COALESCE((NEW.raw_user_meta_data->>'block'), 'B1') || '_' || NEW.id::text,
    0,
    'foodie'::loyalty_tier,
    0,
    0.00,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger with the standard name
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify the trigger was created successfully
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Test query to verify function exists and has correct signature
SELECT 
    proname as function_name,
    proargnames as argument_names,
    proargtypes::regtype[] as argument_types
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Show the complete function definition
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Success message
SELECT '✅ AUTH TRIGGER FIXED SUCCESSFULLY!' as status;








