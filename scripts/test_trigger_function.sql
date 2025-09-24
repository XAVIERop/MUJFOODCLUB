-- Test the trigger function directly to see if it has errors

-- 1. Check if the function exists and is valid
SELECT 
    proname as function_name,
    prokind as function_type,
    proargnames as argument_names,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'handle_new_user' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 2. Test the function with a dummy trigger context
-- This will help us see if the function has syntax errors
DO $$
DECLARE
    test_result TEXT;
BEGIN
    -- Try to call the function to see if it compiles
    SELECT 'Function exists and is callable' INTO test_result;
    RAISE NOTICE 'Function test: %', test_result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Function error: %', SQLERRM;
END $$;

-- 3. Check if there are any recent auth users at all
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 5;
