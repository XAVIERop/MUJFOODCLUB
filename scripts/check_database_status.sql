-- Check database status and identify issues

-- 1. Check if trigger exists and is active
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 2. Check if function exists
SELECT 
    proname as function_name,
    prokind as function_type,
    proargnames as argument_names
FROM pg_proc 
WHERE proname = 'handle_new_user' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 3. Check profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check recent profile creation attempts
SELECT 
    id,
    email,
    full_name,
    block,
    qr_code,
    created_at
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Check block_type enum values
SELECT unnest(enum_range(NULL::block_type)) as block_values;
