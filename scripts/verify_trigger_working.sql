-- Verify the trigger is working

-- 1. Check if trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 2. Check if function exists and is callable
SELECT 
    proname as function_name,
    prokind as function_type,
    proargnames as argument_names
FROM pg_proc 
WHERE proname = 'handle_new_user' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 3. Check recent profiles to see if any were created recently
SELECT 
    id,
    email,
    full_name,
    block,
    qr_code,
    created_at
FROM public.profiles 
WHERE created_at > NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC;

-- 4. Check if there are any recent auth users without profiles
SELECT 
    au.id as auth_user_id,
    au.email as auth_email,
    au.created_at as auth_created_at,
    p.id as profile_id
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.created_at > NOW() - INTERVAL '10 minutes'
ORDER BY au.created_at DESC;
